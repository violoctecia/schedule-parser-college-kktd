import mongoose, { Schema, Document } from 'mongoose';

export type BotUser = {
    userId: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    pickedType?: string;
    pickedValue?: string;
}

interface IBotUser extends BotUser, Document {}

const botUserSchema = new Schema<IBotUser>({
    userId: { type: Number, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    pickedType: { type: String },
    pickedValue: { type: String },
});

export const BotUserModel = mongoose.model<IBotUser>('botUser', botUserSchema);
