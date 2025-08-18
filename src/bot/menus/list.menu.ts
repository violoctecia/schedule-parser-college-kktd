import { MyContext } from '@/src/types/bot.js';
import { getPaginatedKeyboard } from '@/src/bot/utils/keyboards.js';
import { cacheService } from '@/src/services/cache.service.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { Key } from '@/src/types/keys.js';

export async function showListMenu(
    ctx: MyContext,
    page = 0,
    type: ScheduleType,
    text: string,
    isNewMessage: boolean = false,
) {
    const list = await cacheService.getList(type);

    // сортировка: если начинается с цифры → по числам, иначе по алфавиту
    const sorted = (list as Key[]).sort((a, b) => {
        const aVal = a.normalizedValue;
        const bVal = b.normalizedValue;

        const aNum = parseInt(aVal, 10);
        const bNum = parseInt(bVal, 10);

        // если оба начинаются с числа → сравниваем как числа
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }

        // если один число, другой текст → число выше
        if (!isNaN(aNum) && isNaN(bNum)) return -1;
        if (isNaN(aNum) && !isNaN(bNum)) return 1;

        // оба строки → сравнение по алфавиту (localeCompare поддерживает кириллицу)
        return aVal.localeCompare(bVal, 'ru');
    });

    const keyboard = getPaginatedKeyboard(
        type,
        sorted,
        page,
        6,
        item => item.normalizedValue,
        item => item.id,
    );

    if (isNewMessage) {
        await ctx.reply(text, {
            reply_markup: keyboard,
        });
    } else {
        await ctx.editMessageText(text, {
            reply_markup: keyboard,
        });
    }
}
