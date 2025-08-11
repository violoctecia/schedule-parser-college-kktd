import { Context } from 'grammy';
import tableService from '@/src/services/tableService.js';
import { distance } from 'fastest-levenshtein';
import { botUserService } from '@/src/database/services/botUserService.js';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.js';
import { showGroupMenu } from '@/src/bot/menus/groupMenu.js';
import { showUserMenu } from '@/src/bot/menus/userMenu.js';

function findClosestMultiple(list: string[], value: string, threshold = 2, maxResults = 6): string[] | null {
    const lowerValue = value.toLowerCase();

    const scored = list.map(item => ({
        item,
        dist: distance(item.toLowerCase(), lowerValue),
    }));

    const closeMatches = scored
        .filter(x => x.dist <= threshold)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxResults)
        .map(x => x.item);

    if (closeMatches.length === 0) {
        return null;
    } else {
        return closeMatches;
    }
}

export const userSelectionService = {
    async pickValue(ctx: Context, type: string, value: string, isHandle?: boolean) {
        if (type !== 'group') return;

        const groups = await tableService.getGroupsList();

        // 🔹 1. Точное совпадение
        if (groups.includes(value)) {
            await botUserService.sync(ctx, type, value);
            await showUserMenu(ctx);
            return;
        }

        // 🔹 2. Поиск похожих
        if (isHandle) {
            const closeMatches = findClosestMultiple(groups, value, 3);
            if (closeMatches?.length) {
                const keyboard = getPaginatedKeyboard('group', closeMatches, 0, 6);
                await ctx.reply(
                    `👀 Не удалось найти вашу группу в таблице, <b>но есть ${closeMatches.length > 1 ? 'пару похожих вариантов:' : 'один похожий вариант'}</b>\n\n✏️ Если ни один из вариантов не подходит, можете попробовать ввести группу вручную еще раз.`,
                    { reply_markup: keyboard },
                );
            } else {
                await showGroupMenu(
                    ctx,
                    0,
                    `❌ Не удалось найти вашу группу и похожих вариантов в таблице на текущую неделю.\n\nПопробуйте поискать среди готовых вариантов или ввести группу вручную еще раз.`,
                );
            }
        }
    },
};
