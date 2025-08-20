import { botChatsService } from '@/src/database/bot/bot-chats.service.js';
import { bot } from '@/src/bots/main/index.js';
import { InlineKeyboard, InputFile } from 'grammy';
import { cacheService } from '@/src/services/cache.service.js';

export async function sendNextSchedule() {
    const chats = await botChatsService.getAll();

    let total = 0;
    let success = 0;
    let failed = 0;
    const failedChats: number[] = [];

    for (const chat of chats) {
        total++;
        let kb = new InlineKeyboard();
        const chatId = chat.chatId;

        const schedule = chat.schedule;
        const isGroupChat = chat.chatType !== 'private';

        if (schedule) {
            const images = await cacheService.getImage(schedule.type, schedule.key, 'next');
            console.log(images?.weekTitle);
            if (images) {
                const mediaGroup = images.buffers.map(buf => ({
                    type: 'photo' as const,
                    media: new InputFile(buf),
                    parse_mode: 'HTML' as const,
                }));
                try {
                    await bot.api.sendMediaGroup(chatId, mediaGroup);
                    await bot.api.sendMessage(
                        chatId,
                        `☝️ Новое расписание ${images.weekTitle}`,
                        isGroupChat ? {} : { reply_markup: kb.text('🏠 Меню', 'home') }
                    );
                    success++;
                } catch (e: any) {
                    console.log(`❌ Ошибка при отправке в чат ${chatId}`, e.description ?? e);
                    failed++;
                    failedChats.push(chatId);
                }
            }
        }
    }

    return {
        total,
        success,
        failed,
        failedChats,
    };
}
