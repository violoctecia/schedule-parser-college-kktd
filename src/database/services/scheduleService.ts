import { WeekScheduleModel } from '@/src/database/models/weekScheduleModel.ts';
import type { WeekLessons } from '@/src/types/schedule.ts';

export const scheduleService = {

    async create(data: WeekLessons) {
        const exists = await WeekScheduleModel.findOne({ weekTitle: data.weekTitle });
        if (exists) {
            return `❌ Week ${data.weekTitle} already exists`;
        }

        let newData = new WeekScheduleModel(data);
        await newData.save();
        return `✅ Schedule for week ${data.weekTitle} created`;
    },

    async searchBy(weekTitle: string, param: 'teacher' | 'group' | 'name' | 'audience', value: string) {
        const allowedParams = ['teacher', 'group', 'name', 'audience'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }
        const weekSchedule = await WeekScheduleModel.findOne({ weekTitle });
        if (!weekSchedule) {
            return `❌ Week ${weekTitle} not found`;
        }
        const result = weekSchedule.lessons.filter(lesson => lesson[param] === value);
        console.log(result);
    },
};