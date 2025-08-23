import { InlineKeyboard } from 'grammy';
import { SchedulePosition, ScheduleType } from '@/src/types/schedule.js';
import { UserContext } from '@/src/types/bot.js';

export function scheduleKb(ctx: UserContext, position: SchedulePosition = 'current', type: ScheduleType, key: string) {
    const kb = new InlineKeyboard();

    if (position === 'current') {
        kb.text(`Следующее расписание ➡️`, `schedule_new_${type}_${key}`).row();
    } else {
        kb.text(`⬅️ Текущее расписание `, `schedule_current_${type}_${key}`).row();
    }

    if (ctx.session.rememberedSchedule && ctx.session.rememberedSchedule.key === ctx.session.currentSchedule?.key) {
        kb.text(`🔕 Забыть выбор`, `event_${position}_forgot`).row();
    } else {
        kb.text(`🔔 Запомнить ${ctx.session.currentSchedule?.normalizedValue}`, `event_${position}_remember`).row();
    }

    return kb.text('🏠 Поменять выбор', 'home');
}
