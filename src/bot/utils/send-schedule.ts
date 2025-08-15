import { DayLessons, Schedule, ScheduleType } from '@/src/types/schedule.js';
import { MyContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { generateImage } from '@/src/utils/generate-image.js';
import { InlineKeyboard, InputFile } from 'grammy';

function splitSchedule(schedule: Schedule, maxLessonsPerPart: number = 22): Schedule[] {
    const days = Object.entries(schedule);
    const parts: Schedule[] = [];

    let currentPart: [string, DayLessons][] = [];
    let lessonsInPart = 0;

    for (const [dayName, dayLessons] of days) {
        const dayCount = Object.values(dayLessons).reduce((acc, lessons) => acc + lessons.length, 0);

        if (lessonsInPart + dayCount > maxLessonsPerPart && currentPart.length) {
            parts.push(Object.fromEntries(currentPart) as Schedule);
            currentPart = [];
            lessonsInPart = 0;
        }

        currentPart.push([dayName, dayLessons]);
        lessonsInPart += dayCount;
    }

    if (currentPart.length) {
        parts.push(Object.fromEntries(currentPart) as Schedule);
    }

    return parts;
}


export async function sendSchedule(ctx: MyContext, type: ScheduleType, value: string) {
    let schedule;

    await ctx.editMessageText('Пару секунд, готовим расписание..');

    if (type === 'teacher') {
        const list = await cacheService.getList(type) as { teacherNormalized: string; teacherId: string }[];
        schedule = await scheduleService.getScheduleBy('с 23.01.2025 г. по 30.06.2025 г.', 'teacherId', value);
        value = list.find(t => t.teacherId === value)?.teacherNormalized as string;
    } else {
        schedule = await scheduleService.getScheduleBy('с 23.01.2025 г. по 30.06.2025 г.', type, value);
    }

    const maxLessonsPerImage = 22;
    const scheduleParts = splitSchedule(schedule as Schedule, maxLessonsPerImage);

    await ctx.editMessageText('Еще немного...');

    if (scheduleParts.length > 1) {
        const buffers = await Promise.all(scheduleParts.map(part => generateImage(part, type)));


        const mediaGroup = buffers.map((buf, idx) => ({
            type: 'photo' as const,
            media: new InputFile(buf),
            caption: idx === 0
                ? `<b>Расписание для ${value}</b>\nс 23.01.2025 г. по 30.06.2025 г.\n\nВаше расписание оказалось несколько большим, поэтому мы разделили его на несколько изображений.\n\n/menu - вернуться в меню`
                : undefined,
            parse_mode: 'HTML' as const,
        }));

        await ctx.replyWithMediaGroup(mediaGroup);

        await ctx.deleteMessage();
    } else {
        const buffer = await generateImage(schedule as Schedule, type);

        await ctx.replyWithPhoto(new InputFile(buffer), {
            caption: `<b>Расписание для ${value}</b> с 23.01.2025 г. по 30.06.2025 г.`,
            reply_markup: new InlineKeyboard().text('Вернуться в меню', 'back_to_select_menu'),
        });

        await ctx.deleteMessage();
    }


}