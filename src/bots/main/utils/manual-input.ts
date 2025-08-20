import { UserContext } from '@/src/types/bot.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { cacheService } from '@/src/services/cache.service.js';
import { showListMenu } from '@/src/bots/main/menus/list.menu.js';
import { findClosest } from '@/src/utils/find-closest.js';
import { getPaginatedKeyboard } from '@/src/bots/main/utils/keyboards.js';
import { sendSchedule } from '@/src/bots/main/utils/send-schedule.js';
import { normalizeTeacher } from '@/src/utils/normalize-teacher.js';

export async function handleManualInput(ctx: UserContext, type: ScheduleType, value: string) {
    const list = await cacheService.getList(type);

    const listValues = list.map(o => o.normalizedValue);
    const listIds = list.map(o => o.id);

    if (listValues.includes(value)) {
        const id = list.find(o => o.normalizedValue === value)?.id;
        if (!id) return;
        await sendSchedule(ctx, type, id, 'current', false);
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
                `👀 Возможно вы имели ввиду <b>${closeMatches.length > 1 ? 'что-нибудь из этих вариантов' : 'этот вариант'}?</b>\n\n✏️ Если это не то, что вы искали можете попробовать ввести вручную еще раз или вернуться к готовыи спискам.`,
                { reply_markup: keyboard },
            );
        } else {
            await showListMenu(ctx, 0, type as ScheduleType, `❌ Не удалось найти ${texts[type]} и похожих вариантов в текущей таблице расписания.\n\nПопробуйте поискать среди готовых вариантов или ввести вручную еще раз.`, true);
        }
    }
}
