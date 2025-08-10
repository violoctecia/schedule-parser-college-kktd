import { WeekScheduleModel } from '@/src/database/models/weekScheduleModel.ts';
import type { WeekLessons } from '@/src/types/schedule.ts';

export const scheduleService = {

    async create(data: WeekLessons) {
        const exists = await WeekScheduleModel.findOne({ weekTitle: data.weekTitle });
        if (exists) {
            return `❌ Week ${data.weekTitle} already exists`
        }

        let newData = new WeekScheduleModel(data);
        await newData.save()
        return `✅ Schedule for week ${data.weekTitle} created`;
    },
}