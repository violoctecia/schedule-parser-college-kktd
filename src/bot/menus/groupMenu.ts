import { Context } from 'grammy';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.ts';
import tableService from '@/src/services/tableService.js';

export async function showGroupMenu(ctx: Context, page = 0, text?: string) {
    const groups = await tableService.getGroupsList();
    const keyboard = getPaginatedKeyboard('group', groups, page, 6);

    const msgText = text || '👥 Выберите группу из предложенных вариантов \n\n✏️ Или можете попробовать ввести вручную - при ошибках ввода бот попробует подсказать варианты, которые возможно вы имели в виду.';

    if (text) {
        await ctx.reply(msgText, {
            reply_markup: keyboard,
        });
    } else {
        await ctx.editMessageText(msgText, {
            reply_markup: keyboard,
        });
    }
}

