import { InlineKeyboard } from 'grammy';
import { UserContext } from '@/src/types/bot.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';

export async function selectTypeKb(ctx: UserContext) {
    const type = ctx.chat?.type || 'private';
    await botChatsService.synchronize(ctx);

    const kb = new InlineKeyboard();

    kb.text('👥 Поиск по группе', 'list_group');

    if (type === 'private') {
        kb.row().text('👨‍🏫 Поиск по преподователю', 'list_teacher').row().text('🏫 Поиск по аудитории', 'list_audience');

        if (ctx.session.rememberedSchedule) {
            kb.row().text(`⭐️ ${ctx.session.rememberedSchedule.normalizedValue}`, `schedule_current_${ctx.session.rememberedSchedule.type}_${ctx.session.rememberedSchedule.key}`);
        }
    } else {
        kb.text('👨‍🏫 Поиск по преподователю', 'list_teacher');
    }

    return kb;
}
