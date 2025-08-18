import { Bot, InlineKeyboard, session } from 'grammy';
import { cfg } from '@/src/config.js';
import { AdminContext, AdminSessionData } from '@/src/types/bot.js';
import tableService from '@/src/services/table.service.js';

export const bot = new Bot<AdminContext>(cfg.botAdminToken);
function initial(): AdminSessionData {
    return { step: '' };
}
bot.use(session({ initial }));
bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

const mainMenuKeyboard = {
    reply_markup: new InlineKeyboard()
        .text('Загрузить новое расписание', 'new')
        .row()
        .text('Отправить уведомление', 'notification')
        .text('Удалить расписание', 'delete')
        .row()
        .text('Сменить активное расписание', 'active'),
};

bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id;
    console.log('ADMIN BOT:', 'chatId:', chatId, 'username:', ctx.from?.username);

    if (cfg.adminChatIds.includes(chatId.toString())) {
        await ctx.reply('У вас нет прав для выполнения этой операции.');
        return;
    }

    ctx.session.step = 'menu';
    await ctx.reply(
        ` 🧑‍💻 Добро пожаловать администратор ${ctx.from?.username}`, mainMenuKeyboard,
    );
});

bot.on('message:document', async (ctx) => {
    if (ctx.session.step !== 'new') return;

    const doc = ctx.msg.document;
    if (!doc || !doc.file_name) return;

    try {
        const file = await ctx.getFile();

        if (!file.file_path) {
            await ctx.reply('❌ Не удалось получить путь к файлу на сервере Telegram', mainMenuKeyboard);
            return;
        }

        const fileUrl = `https://api.telegram.org/file/bot${cfg.botAdminToken}/${file.file_path}`;
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        await ctx.reply(`Файл ${doc.file_name} успешно загружен на сервер! Парсер запущен, по готовности вы получите уведомление`, mainMenuKeyboard);

        const result = await tableService.load(undefined, buffer);
        await ctx.deleteMessage()
        await ctx.reply(result, mainMenuKeyboard);
    } catch (err) {
        console.error('Ошибка при загрузке файла:', err);
        await ctx.reply(`❌ Не удалось загрузить файл: ${err}.`, mainMenuKeyboard);
    } finally {
        ctx.session.step = 'menu';
    }
});


bot.callbackQuery('menu', async (ctx) => {
    ctx.session.step = 'menu';
    await ctx.editMessageText(
        ` 🧑‍💻 Добро пожаловать администратор ${ctx.from?.username}`, mainMenuKeyboard);
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('new', async (ctx) => {
    ctx.session.step = 'new';
    await ctx.editMessageText('Пришли таблицу с расписанием в формате .xlsx', {
        reply_markup: new InlineKeyboard().text('Назад', 'menu'),
    });
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    console.error('‼️ Прилетела ошибка в админке:', err);
});

export function startAdminBot() {
    bot.start();
    console.log('✅🧑‍💻 Admin bot started');
}
