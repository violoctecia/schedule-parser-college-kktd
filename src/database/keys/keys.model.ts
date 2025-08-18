import mongoose, { Schema, Document } from 'mongoose';
import { Keys } from '@/src/types/keys.js';

interface IKeys extends Keys, Document {
}

const keysSchema = new Schema<IKeys>({
    type: { type: String, enum: ['teacher', 'group', 'audience'], required: true },
    list: [
        {
            normalizedValue: { type: String, required: true },
            id: { type: String, required: true },
        },
    ],
});

export const KeysModel = mongoose.model<IKeys>('keys', keysSchema);
