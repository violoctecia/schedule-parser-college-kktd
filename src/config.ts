import dotenv from 'dotenv';
dotenv.config();

if (!process.env.BOT_MAIN_TOKEN || !process.env.MONGO_URI || !process.env.BOT_ADMIN_TOKEN) {
    throw new Error('BOT_TOKEN and MONGO_URI and BOT_ADMIN_TOKEN must be set');
}

export const cfg = {
    botToken: process.env.BOT_MAIN_TOKEN,
    botAdminToken: process.env.BOT_ADMIN_TOKEN,
    adminChatIds: process.env.ADMINS?.split(',') || [],
    mongoURI: process.env.MONGO_URI,
    imageMaxCacheSize: 40 * 1024 * 1024, // 40 МБ
};