import { Context, InlineKeyboard } from 'grammy';

export async function showUserMenu(ctx: Context, text?: string) {

    const msgText = text || 'Добро пожаловать в главное меню\n\nБот будет автоматически присылать каждое новое расписание для текущего вашего выбора';

    await ctx.reply(msgText, {
        reply_markup: new InlineKeyboard()
            .text('Расписание на эту неделю', 'show_schedule')
            .row()
            .text('Расписание на следующую неделю', 'show_schedule_next')
            .row()
            .text('Список всех расписаний', 'show_schedule_all')
            .row()
            .text('Профиль', 'profile'),
    });
}

