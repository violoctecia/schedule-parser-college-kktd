import { MyContext } from '@/src/types/bot.js';
import { getPaginatedKeyboard } from '@/src/bots/admin/keyboard.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';

export async function showScheduleList(
    ctx: MyContext,
    page = 0,
    type: string,
    text: string
) {
    const list = await scheduleService.getAllScheduleTitles();

    const keyboard = getPaginatedKeyboard(
        type,
        list,
        page,
        6,
        item => item.weekTitle,
        item => item.weekTitleId,
    );

    await ctx.editMessageText(text, {
        reply_markup: keyboard,
    });
}
