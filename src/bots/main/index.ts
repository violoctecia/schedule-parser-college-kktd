import { Bot, GrammyError, HttpError, InlineKeyboard, session } from 'grammy';
import { UserContext, UserSessionData } from '@/src/types/bot.js';
import { cfg } from '@/src/config.js';
import { registerCallbacks } from '@/src/bots/main/callbacks.js';
import { handleManualInput } from '@/src/bots/main/utils/manual-input.js';
import { notifyAdmins } from '@/src/bots/admin/index.js';

export const bot = new Bot<UserContext>(cfg.botToken);

function initial(): UserSessionData {
    return { isSelecting: false, rememberedSchedule: null, currentSchedule: null };
}

bot.use(session({ initial }));

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

bot.command('start', async (ctx) => {

    if (ctx.chat.type === 'private') {
        await ctx.reply(
            '👋👋 Привет! \n\nБот обновлен и работает в штатном режиме. \nТакже вы можете добавить его в свою беседу и автоматически получать новые расписания. \n\nВсего 2 шага до вашего расписания 👇', {
                reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'select_flow_type'),
            },
        );
    } else {
        await ctx.reply(
            '👋 Всем привет! \nПеред тем как бот начнет присылать новые расписания в этот чат, необходимо его настроить',
            {
                reply_markup: new InlineKeyboard().text('Начать ▶️', 'select_flow_type'),
            },
        );
    }

});

bot.on('message:text', async (ctx) => {
    if (ctx.session.isSelecting && ctx.session.currentSchedule?.type) {
        const userValue = ctx.message.text.trim().toString();
        await handleManualInput(ctx, ctx.session.currentSchedule.type, userValue);
    }
});

bot.on('my_chat_member', async (ctx) => {
    const status = ctx.myChatMember.new_chat_member.status;
    const chatId = ctx.chat.id;

    if (status === 'member' || status === 'administrator') {
       try {
           await ctx.api.sendMessage(
               chatId,
               '👋 Всем привет! /nПеред тем как бот начнет присылать новые расписания в этот чат, необходимо его настроить',
               {
                   reply_markup: new InlineKeyboard().text('Начать ▶️', 'select_flow_type'),
               },
           );
       } catch (e) {

       }
    }

    if (status === 'kicked' || status === 'left') {
        console.log(`Бота удалили из чата ${chatId}`);
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`‼️ Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    console.log(e);
    if (e instanceof GrammyError) {
        console.error('‼️ Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('‼️ Could not contact Telegram:', e);
    } else {
        console.error('‼️ Unknown error:', e);
    }

    if (ctx.chatId) {
        ctx.api.sendMessage(ctx.chatId, 'Кажется что-то пошло не так... Нам уже известна эта ошибка и в ближайшее время она будет исправлена, а пока можете начать заново.', {
            reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'select_flow_type'),
        });
    }

    notifyAdmins('❌ Ошибка в основном боте:\n' + JSON.stringify(e));
});

registerCallbacks(bot);

export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
