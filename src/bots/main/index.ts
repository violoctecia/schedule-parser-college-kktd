import { Bot, session } from 'grammy';
import { UserContext, UserSessionData } from '@/src/types/bot.js';
import { cfg } from '@/src/config.js';
import { registerCallbacks } from '@/src/bots/main/callbacks.js';
import { handleManualInput } from '@/src/bots/main/utils/manual-input.js';
import { notifyAdmins } from '@/src/bots/admin/index.js';
import { selectTypeKb } from '@/src/bots/main/keyboards/select-type.kb.js';
import { limit } from '@grammyjs/ratelimiter';

export const bot = new Bot<UserContext>(cfg.botToken);

function initial(): UserSessionData {
    return { isSelecting: false, rememberedSchedule: null, currentSchedule: null };
}

bot.use(session({ initial }));

bot.use(
    limit({
        timeFrame: 1000,
        limit: 5,
        onLimitExceeded: async (ctx) => {
            console.log('LIMIT EXCEEDED', ctx.from?.id);
        },
        keyGenerator: (ctx) => ctx.chat?.id.toString(),
    }),
);

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

bot.command('start', async (ctx) => {
    const kb = { reply_markup: await selectTypeKb(ctx) };

    if (ctx.chat.type === 'private') {
        await ctx.reply('🏠 Выберите тип расписания для поиска:', kb);
        return;
    }

    await ctx.reply('Выберите тип расписания: группа / преподаватель', kb);
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
        await ctx.reply(
            '👋 Всем привет! \nБот может автоматически присылать новые расписания в этот чат, нужно лишь выбрать нужный параметр для этого чата.\n\n Назначить параметр всегда можно командой /start',
        );
    }

    if (status === 'kicked' || status === 'left') {
        console.log(`Бота удалили из чата ${chatId}`);
    }
});

bot.catch((err) => {
    const e = err.error;
    console.log(e);

    notifyAdmins('❌ Ошибка в основном боте:\n' + JSON.stringify(e));
});

registerCallbacks(bot);

export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
