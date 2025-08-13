import { InlineKeyboard } from 'grammy';

export function getPaginatedKeyboard<T>(
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
        const label1 = getLabel(pageItems[i]);
        const value1 = getValue(pageItems[i]);

        if (i + 1 < pageItems.length) {
            const label2 = getLabel(pageItems[i + 1]);
            const value2 = getValue(pageItems[i + 1]);

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
    navKeyboard.row().text('✏️ Ввести врчную', `manual_${type}`).row();
    navKeyboard.text('🏠 Поменять поиск', `select_flow_type`);


    kb.append(navKeyboard);

    return kb;
}
