import mongoose from 'mongoose';
import { cfg } from '@/src/config.js';

export const initDatabase = () => {
    mongoose
        .connect(cfg.mongoURI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err));
};