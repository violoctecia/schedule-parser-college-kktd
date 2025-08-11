import { InlineKeyboard, Bot, Context } from 'grammy';
import { showGroupMenu } from '@/src/bot/menus/groupMenu.ts';
import { UserStates } from '@/src/bot/states.ts';
import { userSelectionService } from '@/src/bot/services/userSelectionService.js';

function withState(expectedState: string | string[] | RegExp, handler: (ctx: Context) => Promise<void>) {
    return async (ctx: Context) => {
        if (!ctx.callbackQuery) return;

        let currentState = UserStates.get(ctx);

        if (!currentState) {
            UserStates.set(ctx, typeof expectedState === 'string' ? expectedState : '');
            currentState = expectedState.toString();
        }

        const isMatch =
            typeof expectedState === 'string'
                ? currentState === expectedState
                : expectedState instanceof RegExp
                    ? expectedState.test(currentState)
                    : expectedState.includes(currentState);

        if (!isMatch) {
            await ctx.answerCallbackQuery({
                text: '⛔ Действие недоступно в текущем сеансе',
            });
            return;
        }

        await handler(ctx);
    };
}

export function registerCallbacks(bot: Bot) {
    bot.callbackQuery('continue', withState('continue', async (ctx) => {
        await ctx.editMessageText('Выберите тип расписания для поиска:', {
            reply_markup: new InlineKeyboard()
                .text('👥 Поиск по группе', 'search_group')
                .row()
                .text('👨‍🏫 Поиск по преподователю', 'search_teacher')
                .row()
                .text('🏫 Поиск по аудитории', 'search_audience')
                .row()
                .text('📚 Поиск по предмету', 'search_subject'),
        });
        await ctx.answerCallbackQuery();
        UserStates.set(ctx, 'choose_search_type');
    }));

    bot.callbackQuery(/search_.+/, withState('choose_search_type', async (ctx) => {
        if (!ctx.callbackQuery) return;
        const choice = ctx.callbackQuery.data;

        switch (choice) {
            case 'search_group':
                await showGroupMenu(ctx, 0);
                await ctx.answerCallbackQuery();
                UserStates.set(ctx, 'search_type_group');
                break;
            case 'search_teacher':
            case 'search_audience':
            case 'search_subject':
        }

    }));

    bot.callbackQuery(/select_(group|teacher)_(.+)/, withState(/^search_type_/, async (ctx) => {
        if (!ctx.callbackQuery) return;

        const data = ctx.callbackQuery.data;
        if (typeof data !== 'string') return;

        const regex = /^select_(group|teacher)_(.+)$/;
        const match = data.match(regex);
        if (!match) return;

        const type = match[1];
        const value = match[2].trim();

        switch (type) {
            case 'group':
                await userSelectionService.pickValue(ctx, type, value);
                await ctx.answerCallbackQuery();
                break;
            case 'teacher':
        }

    }));


    bot.callbackQuery(/page_\d+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const page = Number(data.split('_')[1]);

        await showGroupMenu(ctx, page);
        await ctx.answerCallbackQuery();

    });
}