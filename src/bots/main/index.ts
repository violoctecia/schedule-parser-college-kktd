import { Bot, GrammyError, HttpError, session } from 'grammy';
import { UserContext, UserSessionData } from '@/src/types/bot.js';
import { cfg } from '@/src/config.js';
import { registerCallbacks } from '@/src/bots/main/callbacks.js';
import { handleManualInput } from '@/src/bots/main/utils/manual-input.js';
import { notifyAdmins } from '@/src/bots/admin/index.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';
import { selectTypeKb } from '@/src/bots/main/keyboards/select-type.kb.js';

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
    await botChatsService.synchronize(ctx);

    if (ctx.chat.type === 'private') {
        await ctx.reply('🏠 Выберите тип расписания для поиска:', { reply_markup: selectTypeKb(ctx) });
        return;
    }

    await ctx.reply('Выберите тип расписания: группа / преподаватель', { reply_markup: selectTypeKb(ctx) });
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
                '👋 Всем привет! \nБот может автоматически присылать новые расписания в этот чат, нужно лишь выбрать нужный параметр для этого чата.\n\n Чтобы начать, введите /start',
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

    // if (ctx.chatId) {
    //     ctx.api.sendMessage(ctx.chatId, 'Кажется что-то пошло не так... Нам уже известна эта ошибка и в ближайшее время она будет исправлена, а пока можете начать заново.', {
    //         reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'select_flow_type'),
    //     });
    // }

    notifyAdmins('❌ Ошибка в основном боте:\n' + JSON.stringify(e));
});

registerCallbacks(bot);

export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
