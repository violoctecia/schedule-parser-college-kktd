import { Lesson, ScheduleType } from '@/src/types/schedule.js';
import { MyContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { generateImage } from '@/src/utils/generate-image.js';
import { InlineKeyboard, InputFile } from 'grammy';

export async function sendSchedule(ctx: MyContext, type: ScheduleType, value: string) {
    if (type === 'teacher') {
        const list = await cacheService.getList(type) as { teacherNormalized: string; teacherId: string }[];
        const teacherName = list.find(t => t.teacherId === value)?.teacherNormalized;
        const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'teacherId', value);
        const buffer = await generateImage(schedule as Record<string, Lesson[]>);
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(new InputFile(buffer),
            {
                caption: `<b>Раписание для ${teacherName}</b> с 23.01.2025 г. по 30.06.2025 г. для\n\nРазмер картинки: ${(buffer.length / 1024).toFixed(2)} KB `,
                reply_markup: new InlineKeyboard().text('Назад', 'back_to_select_menu'),
            },
        );
    } else {
        const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'group', value);
        const buffer = await generateImage(schedule as Record<string, Lesson[]>);
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(new InputFile(buffer),
            {
                caption: `<b>Раписание для ${value}</b> с 23.01.2025 г. по 30.06.2025 г.\n\nРазмер картинки: ${(buffer.length / 1024).toFixed(2)} KB `,
                reply_markup: new InlineKeyboard().text('Назад', 'back_to_select_menu'),
            });
    }
}