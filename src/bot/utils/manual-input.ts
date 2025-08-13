import { MyContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { showListMenu } from '@/src/bot/menus/list.menu.js';
import { findClosest } from '@/src/utils/find-closest.js';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.js';
import { sendSchedule } from '@/src/bot/utils/send-schedule.js';
import { normalizeTeacher } from '@/src/utils/normalize-teacher.js';


export async function handleManualInput(ctx: MyContext, type: ScheduleType, value: string) {

    const list = await cacheService.getList(type);

    if (type !== 'teacher') {
        const listStrings = list as string[]; // тут строки
        if (listStrings.includes(value)) {
            await sendSchedule(ctx, type as ScheduleType, value);
        } else {
            await returnClosest(listStrings, value);
        }
    } else {
        const listObjects = list as { teacherNormalized: string; teacherId: string }[];
        const listIds = listObjects.map(o => o.teacherId);
        const valueNormalized = normalizeTeacher(value);
        await returnClosest(listIds, valueNormalized, true);
    }


    async function returnClosest(stringList: string[], value: string, isTeachers: boolean = false) {
        let closeMatches = findClosest(stringList, value, 3);

        if (closeMatches?.length) {
            let keyboard;

            if (isTeachers) {
                const newList = list as { teacherNormalized: string; teacherId: string }[];
                const filteredList = newList.filter(o => closeMatches?.includes(o.teacherId));

                keyboard = getPaginatedKeyboard(
                    type,
                    filteredList as { teacherNormalized: string; teacherId: string }[],
                    0,
                    6,
                    item => item.teacherNormalized,
                    item => item.teacherId
                )
            } else {
                keyboard = getPaginatedKeyboard(
                    type,
                    closeMatches as string[],
                    0,
                    6,
                    item => item,
                    item => item
                );
            }

            await ctx.reply(
                `👀 Не удалось найти вашу группу в таблице, <b>но есть ${closeMatches.length > 1 ? 'пару похожих вариантов:' : 'один похожий вариант'}</b>\n\n✏️ Если ни один из вариантов не подходит, можете попробовать ввести группу вручную еще раз.`,
                { reply_markup: keyboard },
            );
        } else {
            await showListMenu(ctx, 0, type as ScheduleType, `❌ Не удалось найти вашу группу и похожих вариантов в таблице на текущую неделю.\n\nПопробуйте поискать среди готовых вариантов или ввести группу вручную еще раз.`);
        }
    }
}
