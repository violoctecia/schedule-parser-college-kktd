import { Context, InlineKeyboard } from 'grammy';

export async function showSelectTypeMenu(ctx: Context, isEdit: boolean = false) {
    const kb = {
        reply_markup: new InlineKeyboard()
            .text('👥 Поиск по группе', 'list_group')
            .row()
            .text('👨‍🏫 Поиск по преподователю', 'list_teacher')
            .row()
            .text('🏫 Поиск по аудитории', 'list_audience')
            .row()
            .text('📚 Поиск по предмету', 'list_subject'),
    };

    if (isEdit) {
        await ctx.editMessageText('Выберите тип расписания для поиска:', kb);
    } else {
        await ctx.reply('Выберите тип расписания для поиска:', kb);
    }
}