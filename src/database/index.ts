import mongoose from 'mongoose';
import { cfg } from '@/src/config.js';

export const initDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(cfg.mongoURI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err;
    }
};
