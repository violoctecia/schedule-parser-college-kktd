import dotenv from 'dotenv';
dotenv.config();

if (!process.env.BOT_TOKEN || !process.env.MONGO_URI) {
    throw new Error('BOT_TOKEN and MONGO_URI must be set');
}

export const cfg = {
    botToken: process.env.BOT_TOKEN,
    mongoURI: process.env.MONGO_URI,
    imageMaxCacheSize: 40 * 1024 * 1024, // 40 МБ
};