import { InlineKeyboard } from 'grammy';
import { SchedulePosition } from '@/src/types/schedule.js';
import { icons } from '@/src/bots/admin/icons.js';

export function listKb<T extends { position: SchedulePosition }>(
    event: string,
    items: T[],
    page: number,
    pageSize: number,
    getLabel: (item: T) => string,
    getValue: (item: T) => string,
) {
    const start = page * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    const kb = new InlineKeyboard();

    if (items.length === 0) {
        kb.text('Список пуст', `menu`).row();
        kb.text('🔙 Главное меню', `menu`);
        return kb;
    }

    for (let i = 0; i < pageItems.length; i += 2) {
        const item1 = pageItems[i];
        const label1 = icons[item1.position] + ' ' + getLabel(item1);
        const value1 = getValue(item1);

        if (i + 1 < pageItems.length) {
            const item2 = pageItems[i + 1];
            const label2 = icons[item2.position] + ' ' + getLabel(item2);
            const value2 = getValue(item2);

            kb.text(label1, `select_${event}_${value1}`).text(label2, `select_${event}_${value2}`).row();
        } else {
            kb.text(label1, `select_${event}_${value1}`).row();
        }
    }

    const navKeyboard = new InlineKeyboard();
    if (page > 0) navKeyboard.text('⬅️ Назад', `page_${event}_${page - 1}`);
    if (end < items.length) navKeyboard.text('Вперед ➡️', `page_${event}_${page + 1}`);
    navKeyboard.text('🔙 Главное меню', `menu`);

    kb.append(navKeyboard);

    return kb;
}
