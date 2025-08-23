import { Bot, InlineKeyboard } from 'grammy';
import { tableService } from '@/src/services/table.service.js';
import { cfg } from '@/src/config.js';
import { registerAdminCallbacks } from '@/src/bots/admin/callbacks.js';
import { mainKeyboard } from '@/src/bots/admin/keyboards/main.kb.js';
import { icons } from '@/src/bots/admin/icons.js';
import cron from 'node-cron';

export const bot = new Bot(cfg.botAdminToken);

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    }),
);

bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id;
    console.log('ADMIN BOT:', 'chatId:', chatId, 'username:', ctx.from?.username);

    if (!cfg.adminChatIds.includes(chatId.toString())) {
        await ctx.reply('У вас нет прав для выполнения этой операции.');
        return;
    }

    await ctx.reply(`🧑‍💻 Добро пожаловать администратор ${ctx.from?.username}`, mainKeyboard);
});

bot.on('message:document', async (ctx) => {
    const doc = ctx.msg.document;
    if (!doc || !doc.file_name) return;

    try {
        const file = await ctx.getFile();
        if (!file.file_path) {
            await ctx.reply('❌ Не удалось получить путь к файлу на сервере Telegram', mainKeyboard);
            return;
        }

        const fileUrl = `https://api.telegram.org/file/bot${cfg.botAdminToken}/${file.file_path}`;
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        await ctx.reply(`Файл загружен, процесс парсинга запущен, обычно это занимает несколько секунд. По готовности вы получите уведомление, пожалуйста, подождите..`);

        const result = await tableService.load(undefined, buffer);

        if (typeof result === 'string') {
            throw new Error(result);
        }

        const kb = new InlineKeyboard();
        kb.text('Настроить статус ', `select_position_${result.weekTitleId}`).text('Позже', 'menu');

        await ctx.reply(
            `👍 Файл успешно загружен, хотите установить для него статус ${icons['new']} нового расписания?\n\n
*Статус нового расписания дает пользователям основного бота переключаться на него нажатием на кнопку "Следующее расписание".`,
            { reply_markup: kb },
        );
    } catch (err) {
        console.error('Ошибка при загрузке файла:', err);
        await ctx.reply(`❌ Не удалось загрузить файл: ${err}.`, mainKeyboard);
    }
});

registerAdminCallbacks(bot);

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
    console.log('✅ Admin bot started');

    // Каждый вечер субботы в 20:00 по МСК
    cron.schedule('0 20 * * 6', async () => {
        await notifyAdmins('📢 Напоминание: не пора ли сменить активное расписание?');
    });
}
