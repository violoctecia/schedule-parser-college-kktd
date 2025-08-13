import { InlineKeyboard, Bot } from 'grammy';
import { showListMenu } from '@/src/bot/menus/list.menu.ts';
import { ScheduleType } from '@/src/types/schedule.ts';
import { cacheService } from '@/src/services/cache.service.js';

const listMenuTexts = {
    group: '👥 Выберите группу из предложенных вариантов',
    teacher: '👨‍🏫 Выберите преподавателя:',
    audience: 'Выберите аудиторию:',
    name: 'Выберите предмет:',
};

export function registerCallbacks(bot: Bot) {

    // Select flow
    bot.callbackQuery('select_flow_type', async (ctx) => {
        await ctx.editMessageText('Выберите тип расписания для поиска:', {
            reply_markup: new InlineKeyboard()
                .text('👥 Поиск по группе', 'show_groups')
                .row()
                .text('👨‍🏫 Поиск по преподователю', 'show_teachers')
                .row()
                .text('🏫 Поиск по аудитории', 'show_audiences')
                .row()
                .text('📚 Поиск по предмету', 'show_subjects'),
        });
        await ctx.answerCallbackQuery();
    });

    // Show list
    bot.callbackQuery(/show_.+/, async (ctx) => {
        if (!ctx.callbackQuery) return;
        const type = ctx.callbackQuery.data;

        switch (type) {
            case 'show_groups':
                await showListMenu(ctx, 0, 'group', listMenuTexts.group);
                await ctx.answerCallbackQuery();
                break
            case 'show_teachers':
                await showListMenu(ctx, 0, 'teacher', listMenuTexts.teacher);
                await ctx.answerCallbackQuery();
                break
            case 'show_audiences':
            case 'show_subjects':
        }
    });

    // Pick value of type
    bot.callbackQuery(/select_.+/, async (ctx) => {
        if (!ctx.callbackQuery) return;

        // Вся строка из callback_data
        const data = ctx.callbackQuery.data; // например "select_teacher_123"

        // Разделяем по "_"
        const [, type, value] = data.split("_");
        // type: "teacher"
        // value: "123"

        await ctx.answerCallbackQuery(); // убираем "часики"

        // Дальше можно вызвать что-то в зависимости от type
        if (type === "teacher") {
            const list = await cacheService.getList(type) as { teacher: string; teacherId: string }[];
            const teacherName = list.find(t => t.teacherId === value)?.teacher;
            await ctx.reply(`Вы выбрали преподавателя ${teacherName}`);
        } else {
            await ctx.reply(`Вы выбрали группу ${value}`);
        }
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