import { InlineKeyboard } from 'grammy';

export const mainKeyboard = {
    reply_markup: new InlineKeyboard()
        .text('📋 Загрузить расписание', 'upload_schedule')
        .text('🟢 Настроить статусы', 'list_position')
        .row()
        .text('🗑️ Удалить расписание', 'list_delete')
        .text('🔔 Отправить уведомления', 'send_notification'),
};
