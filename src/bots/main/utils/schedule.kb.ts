import { InlineKeyboard } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';
import { UserContext } from '@/src/types/bot.js';

export function scheduleKb(ctx: UserContext, position: 'current' | 'next' = 'current', type: ScheduleType, key: string) {
    const kb = new InlineKeyboard();

    if (position === 'current') {
        kb.text(`Следующее расписание ➡️`, `schedule_next_${type}_${key}`).row();
    } else {
        kb.text(`⬅️ Текущее расписание `, `schedule_current_${type}_${key}`).row();
    }

    if (ctx.session.rememberedSchedule && ctx.session.rememberedSchedule.key === ctx.session.currentSchedule?.key) {
        kb.text(`🔕 Забыть выбор`, `forgot_${position}`).row();
    } else {
        kb.text(`🔔 Запомнить выбор`, `remember_${position}`).row();
    }

    return kb.text('🏠 Поменять выбор', 'select_flow_type');
}