import { KeysModel } from '@/src/database/keys/keys.model.js';
import { ScheduleType } from '@/src/types/schedule.js';
import { Key } from '@/src/types/keys.js';

export const keysService = {
    async createKey(normalizedValue: string, id: string, type: ScheduleType): Promise<Key | null> {
        if (!normalizedValue || !id) return null;

        let doc = await KeysModel.findOne({ type });
        if (!doc) {
            doc = await KeysModel.create({ type, list: [] });
        }

        doc.list.push({ normalizedValue, id });
        await doc.save();
        return { normalizedValue, id };
    },

    async findAllByType(type: ScheduleType): Promise<Key[]> {
        const doc = await KeysModel.findOne({ type });
        if (!doc) return [];
        return doc.list;
    },
};