import { InlineKeyboard, Bot } from 'grammy';
import { showListMenu } from '@/src/bot/menus/list.menu.ts';
import { ScheduleType } from '@/src/types/schedule.ts';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';

const listMenuTexts = {
    group: '👥 <b>Выберите группу</b> из предложенных вариантов:',
    teacher: '👨‍🏫 <b>Выберите преподавателя</b> из предложенных вариантов:\n\nСписок для удобства отсортирован по алфавиту',
    audience: 'Выберите аудиторию:',
    name: 'Выберите предмет:',
};

export function registerCallbacks(bot: Bot) {

    // Select flow
    bot.callbackQuery('select_flow_type', async (ctx) => {
        await ctx.editMessageText('Выберите тип расписания для поиска:', {
            reply_markup: new InlineKeyboard()
                .text('👥 Поиск по группе', 'list_group')
                .row()
                .text('👨‍🏫 Поиск по преподователю', 'list_teacher')
                .row()
                .text('🏫 Поиск по аудитории', 'list_audience')
                .row()
                .text('📚 Поиск по предмету', 'list_subject'),
        });
        await ctx.answerCallbackQuery();
    });

    // Show list
    bot.callbackQuery(/list.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type] = data.split("_");

        await showListMenu(ctx, 0, type as ScheduleType, listMenuTexts[type as ScheduleType]);
        await ctx.answerCallbackQuery();
    });

    // Pick value of type
    bot.callbackQuery(/select_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type, value] = data.split("_");

        // Дальше можно вызвать что-то в зависимости от type
        if (type === "teacher") {
            const list = await cacheService.getList(type) as { teacherNormalized: string; teacherId: string }[];
            const teacherName = list.find(t => t.teacherId === value)?.teacherNormalized;

            const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'teacherId', value, true)
            console.log(schedule);
            await ctx.reply(`Вы выбрали преподавателя ${teacherName}\n\n${schedule}`);
        } else {
            const schedule = await scheduleService.searchBy('с 23.01.2025 г. по 30.06.2025 г.', 'group', value, true)
            console.log(schedule);
            await ctx.reply(`Вы выбрали группу ${value}\n\n${schedule}`);
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