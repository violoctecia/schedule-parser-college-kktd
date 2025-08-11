import { WeekScheduleModel } from '@/src/modules/schedule/weekSchedule.model.ts';
import type { Lesson, WeekLessons } from '@/src/types/schedule.ts';

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

    async searchBy(weekTitle: string, param: 'teacher' | 'group' | 'name' | 'audience', value: string, sortByDay?: boolean) {
        const allowedParams = ['teacher', 'group', 'name', 'audience'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }
        const weekSchedule = await WeekScheduleModel.findOne({ weekTitle });
        if (!weekSchedule) {
            return `❌ Week ${weekTitle} not found`;
        }
        const result = weekSchedule.lessons.filter(lesson => lesson[param] === value);
        if (sortByDay) {
            const newObj: Record<string, Lesson[]> = {};

            result.forEach(lesson => {
                if (!newObj[lesson.day]) {
                    newObj[lesson.day] = [];
                }
                newObj[lesson.day].push(lesson);
            });

            return newObj;
        }
        return result;
    },

    async findAllGroups(): Promise<string[]> {
        const weekSchedule = await WeekScheduleModel
            .findOne()
            .sort({ _id: -1 }); // берём последний добавленный документ
        if (!weekSchedule) {
            console.log(`❌ No one week not found`);
            return [] as string[];
        }

        return [...new Set(weekSchedule.lessons.map(l => l.group))]
    }

};