import { WeekScheduleModel } from '@/src/database/schedule/week-schedule.model.js';
import type { Lesson, Schedule, ScheduleType, WeekLessons } from '@/src/types/schedule.js';

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

    async getScheduleBy(weekTitle: string, param: 'teacherId' | 'groupId' | 'audienceId', value: string): Promise<Schedule | string> {
        const allowedParams = ['teacherId', 'groupId', 'audienceId'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }
        const weekSchedule = await WeekScheduleModel.findOne({ weekTitle });
        if (!weekSchedule) {
            return `❌ Week ${weekTitle} not found`;
        }

        const filteredLessons = weekSchedule.lessons.filter(
            lesson => lesson[param] === value,
        );

        const grouped: Schedule = {};

        filteredLessons.forEach(lesson => {
            if (!grouped[lesson.day]) {
                grouped[lesson.day] = {};
            }

            const dayObj = grouped[lesson.day];

            if (!dayObj[lesson.number]) {
                dayObj[lesson.number] = [];
            }

            dayObj[lesson.number].push(lesson);
        });

        Object.keys(grouped).forEach(day => {
            const sortedByNumber: Record<number, Lesson[]> = {};
            Object.keys(grouped[day])
                .sort((a, b) => Number(a) - Number(b))
                .forEach(num => {
                    sortedByNumber[Number(num)] = grouped[day][Number(num)];
                });
            grouped[day] = sortedByNumber;
        });

        return grouped;
    },

};