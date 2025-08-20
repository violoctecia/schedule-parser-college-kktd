import { Bot, InlineKeyboard } from 'grammy';
import { UserContext } from '@/src/types/bot.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { showSelectTypeMenu } from '@/src/bots/main/menus/select-type.menu.js';
import { sendSchedule } from '@/src/bots/main/utils/send-schedule.js';
import { showListMenu } from '@/src/bots/main/menus/list.menu.js';

const listMenuTexts = {
    group: '👥 <b>Выберите группу</b> из предложенных вариантов\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот попробует подсказать варианты',
    teacher: '👨‍🏫 <b>Выберите преподавателя</b> из предложенных вариантов. Список для удобства отсортирован по алфавиту\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот попробует подсказать варианты',
    audience: 'Выберите аудиторию из предложенных вариантов.\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот попробует подсказать варианты',
};


export function registerCallbacks(bot: Bot<UserContext>) {

    // Select flow
    bot.callbackQuery('select_flow_type', async (ctx) => {
        ctx.session.isSelecting = false;

        await showSelectTypeMenu(ctx, true);
        await ctx.answerCallbackQuery();
    });

    // Show list
    bot.callbackQuery(/list.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type] = data.split('_');

        ctx.session.isSelecting = true;
        ctx.session.currentSchedule = {
            type: type as ScheduleType,
        };

        await showListMenu(ctx, 0, type as ScheduleType, listMenuTexts[type as ScheduleType]);
        await ctx.answerCallbackQuery();
    });

    // Pick value in list
    bot.callbackQuery(/select_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type, value] = data.split('_');

        await sendSchedule(ctx, type as ScheduleType, value, 'current');
        await ctx.answerCallbackQuery();
    });

    // Change schedule position
    bot.callbackQuery(/schedule_+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, position, type, value] = data.split('_');

        await sendSchedule(ctx, type as ScheduleType, value, position as 'current' | 'next');
        await ctx.answerCallbackQuery();
    });

    // Remember selection
    bot.callbackQuery('remember', async (ctx) => {
        if (!ctx.session.currentSchedule) return;

        const currentSchedule = ctx.session.currentSchedule;
        if (!currentSchedule.normalizedValue || !currentSchedule.key) return;

        const rememberedSchedule = ctx.session.rememberedSchedule;

        const text = rememberedSchedule ?
            `🗝️ Ваш выбор уведомлений был изменен с ${rememberedSchedule.normalizedValue} на ${currentSchedule.normalizedValue}` :
            `🗝️ Теперь вы будете получать уведомление о новых расписаниях сразу для ${currentSchedule.normalizedValue}`;

        ctx.session.rememberedSchedule = {
            type: currentSchedule.type,
            normalizedValue: currentSchedule.normalizedValue,
            key: currentSchedule.key
        }

        await ctx.editMessageText(text, {
            reply_markup: new InlineKeyboard()
                .text(`🏠 Назад`, `select_flow_type`),
        });
        await ctx.answerCallbackQuery();
    });

    // Navigation list
    bot.callbackQuery(/page_(group|teacher|audience)_\d+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const regex = /^page_(group|teacher|audience)_(.+)$/;
        const match = data.match(regex);
        if (!match) return;

        const type = match[1] as ScheduleType;
        const page = Number(match[2].trim());

        await showListMenu(ctx, page, type, listMenuTexts[type]);
        await ctx.answerCallbackQuery();
    });
}