import { Bot } from 'grammy';
import { UserContext } from '@/src/types/bot.js';
import { SchedulePosition, ScheduleType } from '@/src/types/schedule.js';
import { sendSchedule } from '@/src/bots/main/utils/send-schedule.js';
import { listTypeMenu } from '@/src/bots/main/menus/list.menu.js';
import { scheduleKb } from '@/src/bots/main/keyboards/schedule.kb.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';
import { selectTypeKb } from '@/src/bots/main/keyboards/select-type.kb.js';


export function registerCallbacks(bot: Bot<UserContext>) {

    // Menu Select Type
    bot.callbackQuery('home', async (ctx) => {
        ctx.session.isSelecting = false;
        await botChatsService.synchronize(ctx);

        await ctx.editMessageText('🏠 Выберите тип расписания для поиска:',
            { reply_markup: selectTypeKb(ctx) });
        await ctx.answerCallbackQuery();
    });

    // Menu List Of Type
    bot.callbackQuery(/list.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type] = data.split('_');

        const texts = {
            group: '👥 Выберите <b>группу</b> из предложенных вариантов',
            teacher: '👨‍🏫 Выберите <b>преподавателя</b> из предложенных вариантов. Список для удобства отсортирован по алфавиту',
            audience: '🏫 Выберите <b>аудиторию</b> из предложенных вариантов.',
        };

        let text = texts[type as ScheduleType];

        if (ctx.chat?.type === 'private') {
            ctx.session.isSelecting = true;
            ctx.session.currentSchedule = {
                type: type as ScheduleType,
            };
            text = text + '\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот попробует подсказать варианты';
        }

        await listTypeMenu(ctx, 0, type as ScheduleType, text);
        await ctx.answerCallbackQuery();
    });

    // Show Schedule
    bot.callbackQuery(/select_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type, value] = data.split('_');

        await sendSchedule(ctx, type as ScheduleType, value, 'current', true);
        await ctx.answerCallbackQuery();
    });

    // Change Schedule Position
    bot.callbackQuery(/schedule_+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, position, type, value] = data.split('_');

        await sendSchedule(ctx, type as ScheduleType, value, position as Extract<SchedulePosition, 'current' | 'new'>);
        await ctx.answerCallbackQuery();
    });

    // Remember/Forgot Selection
    bot.callbackQuery(/event_+/, async (ctx) => {
        if (!ctx.session.currentSchedule) return;

        const currentSchedule = ctx.session.currentSchedule;
        if (!currentSchedule.normalizedValue || !currentSchedule.key) return;

        const data = ctx.callbackQuery.data;
        const [, position, event] = data.split('_');

        if (event === 'remember') {
            ctx.session.rememberedSchedule = {
                type: currentSchedule.type,
                normalizedValue: currentSchedule.normalizedValue,
                key: currentSchedule.key,
            };
        } else {
            ctx.session.rememberedSchedule = null;
        }

        await botChatsService.setSchedule(ctx);
        await ctx.editMessageReplyMarkup({
            reply_markup: scheduleKb(ctx, position as Extract<SchedulePosition, 'current' | 'new'>, currentSchedule.type, currentSchedule.key),
        });
        await ctx.answerCallbackQuery();
    });

    // Navigation List
    bot.callbackQuery(/page_(group|teacher|audience)_\d+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type, page] = data.split('_');

        await listTypeMenu(ctx, Number(page), type as ScheduleType);
        await ctx.answerCallbackQuery();
    });
}