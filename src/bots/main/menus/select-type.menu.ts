import { InlineKeyboard } from 'grammy';
import { UserContext } from '@/src/types/bot.js';


export async function showSelectTypeMenu(ctx: UserContext, isEdit: boolean = false, text?: string) {

    const kb = {
        reply_markup: new InlineKeyboard()
            .text('👥 Поиск по группе', 'list_group')
            .row()
            .text('👨‍🏫 Поиск по преподователю', 'list_teacher')
            .row()
            .text('🏫 Поиск по аудитории', 'list_audience'),
    };

    if (ctx.session.rememberedSchedule) {
        kb.reply_markup.inline_keyboard.push([{
            text: `🗝️ ${ctx.session.rememberedSchedule.normalizedValue}`,
            callback_data: `schedule_current_${ctx.session.rememberedSchedule.type}_${ctx.session.rememberedSchedule.key}`
        }]);
    }

    if (isEdit) {
        await ctx.editMessageText(text ? text : '🏠 Выберите тип расписания для поиска:', kb);
    } else {
        await ctx.reply(text ? text : '🏠 Выберите тип расписания для поиска:', kb);
    }
}