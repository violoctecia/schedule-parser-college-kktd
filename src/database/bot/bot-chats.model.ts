import mongoose, { Schema, Document } from 'mongoose';
import { BotChat } from '@/src/types/bot.js';

interface IBotChat extends BotChat, Document {}

const selectedScheduleSchema = new Schema(
    {
        type: { type: String, required: true },
        normalizedValue: { type: String, required: true },
        key: { type: String, required: true },
    },
    { _id: false },
);

const botChatSchema = new Schema<IBotChat>({
    chatId: { type: Number, required: true, unique: true },
    chatType: { type: String, enum: ['private', 'group', 'supergroup'], required: true },

    // для private
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },

    // для групп/каналов
    chatTitle: { type: String },

    // выбранное расписание
    schedule: { type: selectedScheduleSchema, default: null },
});

export const BotChatsModel = mongoose.model<IBotChat>('botChat', botChatSchema);
