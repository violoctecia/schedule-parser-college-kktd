import { MyContext } from '@/src/types/bot.js';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.js';
import { cacheService } from '@/src/services/cache.service.js';
import { ScheduleType } from '@/src/types/schedule.js';

export async function showListMenu(
    ctx: MyContext,
    page = 0,
    type: ScheduleType,
    text: string
) {
    const list = await cacheService.getList(type);

    const keyboard =
        type === 'teacher'
            ? getPaginatedKeyboard(
                type,
                list as { teacherNormalized: string; teacherId: string }[],
                page,
                6,
                item => item.teacherNormalized,
                item => item.teacherId
            )
            : getPaginatedKeyboard(
                type,
                list as string[],
                page,
                6,
                item => item,
                item => item
            );

    await ctx.editMessageText(text, {
        reply_markup: keyboard,
    });
}

