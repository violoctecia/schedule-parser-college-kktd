import { InlineKeyboard, Bot, InputFile } from 'grammy';
import { showListMenu } from '@/src/bot/menus/list.menu.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { generateImage } from '@/src/utils/generate-image.js';
import { showSelectTypeMenu } from '@/src/bot/menus/select-type.menu.js';
import { MyContext } from '@/src/types/bot.js';
import { sendSchedule } from '@/src/bot/utils/send-schedule.js';

const listMenuTexts = {
    group: '👥 <b>Выберите группу</b> из предложенных вариантов\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот подскажет варианты',
    teacher: '👨‍🏫 <b>Выберите преподавателя</b> из предложенных вариантов. Список для удобства отсортирован по алфавиту\n\n✏️ Или <b>попробуйте ввести вручную</b>, бот подскажет варианты',
    audience: 'Выберите аудиторию:',
    name: 'Выберите предмет:',
};

export function registerCallbacks(bot: Bot<MyContext>) {
    // Select flow
    bot.callbackQuery('select_flow_type', async (ctx) => {
        await showSelectTypeMenu(ctx, true);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('back_to_select_menu', async (ctx) => {
        await ctx.editMessageReplyMarkup({
            reply_markup: {
                inline_keyboard: [],
            },
        });
        await showSelectTypeMenu(ctx);
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

        await sendSchedule(ctx, type as ScheduleType, value);
        await ctx.answerCallbackQuery();
    });

    // Manual search
    bot.callbackQuery(/manual_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, type] = data.split('_');

        const msg = {
            group: {
                text: 'группу <b>(например: 09.02.07-1)</b>',
                placeholder: '09.02.07-'
            },
            teacher: {
                text: 'преподавателя <b>(например: Харитонова)</b>',
                placeholder: 'Харитонова..'
            },
            audience: {
                text: 'аудиторию <b>(например: 306)</b>',
                placeholder: '311?'
            },
            name: {
                text: 'предмет <b>(например: Обществознание)</b>',
                placeholder: 'Химия?'
            }
        }

        await ctx.deleteMessage();
        await ctx.reply(`В ответе на это сообщение попробуйте вручную ввести ${msg[type as ScheduleType].text}, в случае неправильного ввода <b>бот подскажет</b> варианты, которые возможно вы имели ввиду\n\n/menu - вернуться в главное меню`, {
            reply_markup: {
                force_reply: true,
                input_field_placeholder: msg[type as ScheduleType].placeholder,
            },
        });
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
        console.log('nav', page);
        await showListMenu(ctx, page, type, listMenuTexts[type]);
        await ctx.answerCallbackQuery();
    });
}