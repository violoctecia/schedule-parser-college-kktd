import { Bot, InlineKeyboard } from 'grammy';
import { cfg } from '@/src/config.ts';
import { registerCallbacks } from '@/src/bot/callbacks.js';

export const bot = new Bot(cfg.botToken);

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

bot.command('start', async (ctx) => {
    await ctx.reply(
        '👋👋 Привет! \n\nБот обновлен и работает в штатном режиме. Всего 2 шага до вашего расписания 👇',
        {
            reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'select_flow_type'),
        },
    );
});

registerCallbacks(bot);

export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
