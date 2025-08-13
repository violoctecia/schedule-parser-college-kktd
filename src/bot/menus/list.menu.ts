import { Context } from 'grammy';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.ts';
import { cacheService } from '@/src/services/cache.service.js';
import { ScheduleType } from '@/src/types/schedule.ts';


export async function showListMenu(
    ctx: Context,
    page = 0,
    type: ScheduleType,
    text: string
) {
    const list = await cacheService.getList(type);

    const keyboard =
        type === 'teacher'
            ? getPaginatedKeyboard(
                type,
                list as { teacher: string; teacherId: string }[],
                page,
                6,
                item => item.teacher,
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

