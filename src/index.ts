import mongoose from 'mongoose';
import tableService from '@/src/services/tableService.ts';
import { cfg } from '@/src/config.ts';
import { startBot } from '@/src/bot/index.js';

mongoose
    .connect(cfg.mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

startBot()
// tableService.load('uploads/example.xlsx');
