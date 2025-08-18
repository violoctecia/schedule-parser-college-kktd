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

    const listValues = list.map(o => o.normalizedValue);
    const listIds = list.map(o => o.id);

    if (listValues.includes(value)) {
        await sendSchedule(ctx, type as ScheduleType, value);
    } else {
        if (type === 'teacher') {
            value = normalizeTeacher(value);
        }
        await returnClosest(listIds, value);
    }


    async function returnClosest(stringList: string[], value: string) {
        let closeMatches = findClosest(stringList, value, 3);

        const texts = {
            'group': 'вашу группу',
            'teacher': 'это имя преподователя',
            'audience': 'эту аудиторию',
        };

        if (closeMatches?.length) {
            const filteredList = list.filter(o => closeMatches.includes(o.id));

            let keyboard = getPaginatedKeyboard(
                type,
                filteredList,
                0,
                6,
                item => item.normalizedValue,
                item => item.id,
            );

            await ctx.reply(
                `👀 Не удалось найти ${texts[type]} в текущей таблице расписания, <b>но есть ${closeMatches.length > 1 ? 'пару похожих вариантов:' : '1️⃣ один похожий вариант'}</b>\n\n✏️ Если ни один из вариантов не подходит, можете попробовать ввести вручную еще раз.`,
                { reply_markup: keyboard },
            );
        } else {
            await showListMenu(ctx, 0, type as ScheduleType, `❌ Не удалось найти ${texts[type]} и похожих вариантов в текущей таблице расписания.\n\nПопробуйте поискать среди готовых вариантов или ввести вручную еще раз.`, true);
        }
    }
}
