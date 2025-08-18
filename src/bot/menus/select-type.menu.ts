import { InlineKeyboard } from 'grammy';
import { MyContext } from '@/src/types/bot.js';

export async function showSelectTypeMenu(ctx: MyContext, isEdit: boolean = false) {
    const kb = {
        reply_markup: new InlineKeyboard()
            .text('👥 Поиск по группе', 'list_group')
            .row()
            .text('👨‍🏫 Поиск по преподователю', 'list_teacher')
            .row()
            .text('🏫 Поиск по аудитории', 'list_audience')


    };

    if (isEdit) {
        await ctx.editMessageText('🏠 Выберите тип расписания для поиска:', kb);
    } else {
        await ctx.reply('🏠 Выберите тип расписания для поиска:', kb);
    }
}