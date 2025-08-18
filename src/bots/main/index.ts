import { Bot, InlineKeyboard, session } from 'grammy';
import { MyContext, SessionData } from '@/src/types/bot.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { cfg } from '@/src/config.js';
import { registerCallbacks } from '@/src/bots/main/callbacks.js';
import { handleManualInput } from '@/src/bots/main/utils/manual-input.js';
import { showSelectTypeMenu } from '@/src/bots/main/menus/select-type.menu.js';

export const bot = new Bot<MyContext>(cfg.botToken);

function initial(): SessionData {
    return {};
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
    await ctx.reply(
        '👋👋 Привет! \n\nБот обновлен и работает в штатном режиме. Всего 2 шага до вашего расписания 👇', {
            reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'select_flow_type'),
        },
    );
});

bot.command('menu', async (ctx) => {
    await showSelectTypeMenu(ctx);
});

bot.on('message:text', async (ctx) => {
    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) return;

    const match = replyTo.text?.startsWith('В ответе на это сообщение');
    if (!match) return;

    const userValue = ctx.message.text.trim();
    let type: ScheduleType | null = null;

    if (replyTo.text?.includes('группу')) {
        type = 'group';
    } else if (replyTo.text?.includes('преподавателя')) {
        type = 'teacher';
    } else if (replyTo.text?.includes('аудиторию')) {
        type = 'audience';
    }

    await handleManualInput(ctx, type as ScheduleType, userValue);
});

bot.catch((err) => {
    console.error('‼️ Прилетела ошибка:', err);
});

registerCallbacks(bot);

export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
