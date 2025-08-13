import { InlineKeyboard, Bot, InputFile } from 'grammy';
import { showListMenu } from '@/src/bot/menus/list.menu.ts';
import { ScheduleType } from '@/src/types/schedule.ts';
import { cacheService } from '@/src/services/cache.service.ts';
import { scheduleService } from '@/src/database/schedule/schedule.service.ts';
import { generateImage } from '@/src/utils/generate-image.ts';
import { showSelectTypeMenu } from '@/src/bot/menus/select-type.menu.js';


const listMenuTexts = {
    group: '👥 <b>Выберите группу</b> из предложенных вариантов:',
    teacher: '👨‍🏫 <b>Выберите преподавателя</b> из предложенных вариантов:\n\nСписок для удобства отсортирован по алфавиту',
    audience: 'Выберите аудиторию:',
    name: 'Выберите предмет:',
};

export function registerCallbacks(bot: Bot) {
    // Select flow
    bot.callbackQuery('select_flow_type', async (ctx) => {
        await showSelectTypeMenu(ctx, true)
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('back_to_select_menu', async (ctx) => {
        await ctx.deleteMessage();
        await showSelectTypeMenu(ctx)
        await ctx.answerCallbackQuery();
    });

    // Show list
    bot.callbackQuery(/list.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type] = data.split('_');

        await showListMenu(ctx, 0, type as ScheduleType, listMenuTexts[type as ScheduleType]);
        await ctx.answerCallbackQuery();
    });

    // Pick value of type
    bot.callbackQuery(/select_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type, value] = data.split('_');

        await ctx.editMessageText('Пару секунд, готовим расписание..');

        // Дальше можно вызвать что-то в зависимости от type
        if (type === 'teacher') {
            const list = await cacheService.getList(type) as { teacherNormalized: string; teacherId: string }[];
            const teacherName = list.find(t => t.teacherId === value)?.teacherNormalized;
            const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'teacherId', value);

            if (typeof schedule === 'object') {
                const buffer = await generateImage(schedule);
                console.log('Размер картинки:', (buffer.length / 1024).toFixed(2), 'KB');

                await ctx.deleteMessage();
                await ctx.replyWithPhoto(new InputFile(buffer),
                    {
                        caption: `Расписание с 23.01.2025 г. по 30.06.2025 г. для ${teacherName}`,
                        reply_markup: new InlineKeyboard().text('Назад', 'back_to_select_menu'),
                    },
                );
            }
        } else {
            const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'group', value);

            if (typeof schedule === 'object') {
                const buffer = await generateImage(schedule);
                console.log('Размер картинки:', (buffer.length / 1024).toFixed(2), 'KB');

                await ctx.deleteMessage();
                await ctx.replyWithPhoto(new InputFile(buffer),
                    {
                        caption: `Расписание с 23.01.2025 г. по 30.06.2025 г. для ${value}`,
                        reply_markup: new InlineKeyboard().text('Назад', 'back_to_select_menu'),
                    });
            }
        }

        await ctx.answerCallbackQuery();
    });


    // Navigation list
    bot.callbackQuery(/page_(group|teacher|audience|subject)_\d+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const regex = /^page_(group|teacher)_(.+)$/;
        const match = data.match(regex);
        if (!match) return;

        const type = match[1] as ScheduleType;
        const page = Number(match[2].trim());

        await showListMenu(ctx, page, type, listMenuTexts[type]);
        await ctx.answerCallbackQuery();
    });
}