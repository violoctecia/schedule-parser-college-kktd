import { InlineKeyboard } from 'grammy';

export function getPaginatedKeyboard(type: string, items: string[], page: number, pageSize: number) {
    const start = page * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    const kb = new InlineKeyboard();

    for (let i = 0; i < pageItems.length; i += 2) {
        if (i + 1 < pageItems.length) {
            kb.text(pageItems[i], `select_${type}_${pageItems[i]}`)
                .text(pageItems[i + 1], `select_${type}_${pageItems[i + 1]}`)
                .row();
        } else {
            kb.text(pageItems[i], `select_${type}_${pageItems[i]}`).row();
        }
    }

    const navKeyboard = new InlineKeyboard();
    if (page > 0) navKeyboard.text('⬅️ Назад', `page_${page - 1}`);
    if (end < items.length) navKeyboard.text('Вперед ➡️', `page_${page + 1}`);

    kb.append(navKeyboard);

    return kb;
}
