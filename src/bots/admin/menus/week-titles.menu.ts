import { listKb } from '@/src/bots/admin/keyboards/list.kb.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { Context } from 'grammy';

export async function showWeekTitleList(ctx: Context, page = 0, event: string, text?: string) {
    const list = await scheduleService.getAllScheduleTitles();

    const keyboard = listKb(
        event,
        list,
        page,
        6,
        (item) => item.weekTitle,
        (item) => item.weekTitleId,
    );

    if (text) {
        await ctx.editMessageText(text, {
            reply_markup: keyboard,
        });
    } else {
        await ctx.editMessageReplyMarkup({
            reply_markup: keyboard,
        });
    }
}
