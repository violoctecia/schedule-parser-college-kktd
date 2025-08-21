import { Bot, InlineKeyboard } from 'grammy';
import tableService from '@/src/services/table.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { cfg } from '@/src/config.js';
import { showScheduleList } from '@/src/bots/admin/schedule-titles.menu.js';
import { sendNextSchedule } from '@/src/bots/main/utils/notification.js';

export const bot = new Bot(cfg.botAdminToken);

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

const texts = {
    'delete': 'Выберите расписание из списка, которое хотите удалить\n\n ✅ - текущее активное расписание',
    'active': 'Выберите расписание из списка, которое хотите сделать активным (активное расписание будет выдаваться пользователям по умолчанию в основном боте)\n\n ✅ - текущее активное расписание',
};

const mainMenuKeyboard = {
    reply_markup: new InlineKeyboard()
        .text('🆕 Загрузить новое расписание', 'new')
        .row()
        .text('🔔 Отправить всем уведомление', 'notification')
        .row()
        .text('🗑️ Удалить расписание', 'delete')
        .row()
        .text('📌 Сменить активное расписание', 'active'),
};

bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id;
    console.log('ADMIN BOT:', 'chatId:', chatId, 'username:', ctx.from?.username);

    if (!cfg.adminChatIds.includes(chatId.toString())) {
        await ctx.reply('У вас нет прав для выполнения этой операции.');
        return;
    }

    await ctx.reply(
        ` 🧑‍💻 Добро пожаловать администратор ${ctx.from?.username}`, mainMenuKeyboard,
    );
});

bot.on('message:document', async (ctx) => {
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

        await ctx.reply(`Файл ${doc.file_name} успешно загружен на сервер! Парсер запущен, по готовности вы получите уведомление, пожалуйста, подождите...`);

        const result = await tableService.load(undefined, buffer);

        await ctx.reply(result, mainMenuKeyboard);
    } catch (err) {
        console.error('Ошибка при загрузке файла:', err);
        await ctx.reply(`❌ Не удалось загрузить файл: ${err}.`, mainMenuKeyboard);
    }
});

bot.callbackQuery('menu', async (ctx) => {
    await ctx.editMessageText(
        ` 🧑‍💻 Добро пожаловать администратор ${ctx.from?.username}`, mainMenuKeyboard);
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('new', async (ctx) => {
    await ctx.editMessageText('Загрузите или перешлите в этот чат новую таблицу с расписанием в формате .xlsx', {
        reply_markup: new InlineKeyboard().text('Назад', 'menu'),
    });
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('notification', async (ctx) => {
    await ctx.editMessageText('Отправка уведомлений о следующем расписании, пожалуйста, подождите...');
    const stats = await sendNextSchedule();
    await ctx.reply(`${JSON.stringify(stats)}`, mainMenuKeyboard);

});

bot.callbackQuery('active', async (ctx) => {
    await showScheduleList(ctx, 0, 'active', texts.active);
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('delete', async (ctx) => {
    await showScheduleList(ctx, 0, 'delete', texts.delete);
    await ctx.answerCallbackQuery();
});

// Pick value of type
bot.callbackQuery(/select_.+/, async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [, type, value] = data.split('_');

    switch (type) {
        case 'active':
            await scheduleService.setCurrent(value);

            await ctx.editMessageText('Активное расписание успешно изменено', mainMenuKeyboard);
            break;
        case 'delete':
            scheduleService.delete(value);
            await ctx.editMessageText('Расписание удалено', mainMenuKeyboard);
            break;
    }

    await ctx.answerCallbackQuery();
});

// Navigation list
bot.callbackQuery(/page_(active|delete)_\d+/, async (ctx) => {
    const data = ctx.callbackQuery.data;
    const regex = /^page_(active|delete)_(.+)$/;
    const match = data.match(regex);
    if (!match) return;

    const type = match[1] as 'active' | 'delete';
    const page = Number(match[2].trim());

    await showScheduleList(ctx, page, type, texts[type]);
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    console.error('‼️ Прилетела ошибка в админке:', err);
});

export async function notifyAdmins(message: string) {
    for (const adminId of cfg.adminChatIds) {
        try {
           await bot.api.sendMessage(adminId, message);
        } catch (err) {
            console.error(`❌ Не удалось отправить сообщение админу ${adminId}:`, err);
        }
    }
}

export function startAdminBot() {
    bot.start();
    console.log('✅🧑‍💻 Admin bot started');
}
