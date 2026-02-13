import dotenv from 'dotenv';
dotenv.config();

if (!process.env.BOT_MAIN_TOKEN || !process.env.MONGO_URI || !process.env.BOT_ADMIN_TOKEN || !process.env.ADMIN_CHAT_IDS) {
    throw new Error('BOT_TOKEN and MONGO_URI and BOT_ADMIN_TOKEN and ADMIN_CHAT_IDS must be set');
}

export const cfg = {
    botToken: process.env.BOT_MAIN_TOKEN,
    botAdminToken: process.env.BOT_ADMIN_TOKEN,
    adminChatIds: process.env.ADMIN_CHAT_IDS?.split(','),
    mongoURI: process.env.MONGO_URI,
    imageMaxCacheSize: process.env.IMAGE_MAX_CACHE_SIZE ? parseInt(process.env.IMAGE_MAX_CACHE_SIZE) : 40 * 1024 * 1024, // 40 МБ
};
