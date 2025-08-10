import dotenv from 'dotenv';
import mongoose from 'mongoose';
import tableService from '@/src/parser/tableService.ts';

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables');
}

mongoose
    .connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

tableService.load('uploads/example.xlsx');
