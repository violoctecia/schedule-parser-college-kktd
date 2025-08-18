import { InlineKeyboard } from 'grammy';

export function getPaginatedKeyboard<T extends { isCurrent?: boolean }>(
    type: string,
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

    for (let i = 0; i < pageItems.length; i += 2) {
        const item1 = pageItems[i];
        const label1 = (item1.isCurrent ? '✅ ' : '') + getLabel(item1);
        const value1 = getValue(item1);

        if (i + 1 < pageItems.length) {
            const item2 = pageItems[i + 1];
            const label2 = (item2.isCurrent ? '✅ ' : '') + getLabel(item2);
            const value2 = getValue(item2);

            kb.text(label1, `select_${type}_${value1}`)
                .text(label2, `select_${type}_${value2}`)
                .row();
        } else {
            kb.text(label1, `select_${type}_${value1}`).row();
        }
    }

    const navKeyboard = new InlineKeyboard();
    if (page > 0) navKeyboard.text('⬅️ Назад', `page_${type}_${page - 1}`);
    if (end < items.length) navKeyboard.text('Вперед ➡️', `page_${type}_${page + 1}`);
    navKeyboard.text('Главное меню', `menu`);

    kb.append(navKeyboard);

    return kb;
}

