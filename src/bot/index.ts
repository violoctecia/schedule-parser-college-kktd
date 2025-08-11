// src/bot/index.ts
import { Bot, InlineKeyboard } from 'grammy';
import { cfg } from '@/src/config.ts';
import { registerCallbacks } from '@/src/bot/callbacks.ts';
import { botUserService } from '@/src/database/services/botUser.service.ts';
import { UserStates } from '@/src/bot/states.js';
import { userSelectionService } from '@/src/bot/services/userSelectionService.js';

export const bot = new Bot(cfg.botToken);

registerCallbacks(bot);

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

bot.command('start', async (ctx) => {
    await ctx.reply(
        '👋 Привет! \n\nБот обновлен и работает в штатном режиме. Всего 2 шага до вашего расписания 👇',
        {
            reply_markup: new InlineKeyboard().text('Продолжить ▶️', 'continue'),
        },
    );
    UserStates.set(ctx, 'continue');
    await botUserService.sync(ctx);
});

bot.on('message:text', async (ctx) => {
    const state = UserStates.get(ctx);

    if (state === 'search_type_group') {
        await userSelectionService.pickValue(ctx, 'group', ctx.message.text, true);
    }
});


export function startBot() {
    bot.start();
    console.log('✅ Bot started');
}
