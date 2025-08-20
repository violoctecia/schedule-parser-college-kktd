import { WeekScheduleModel } from '@/src/database/schedule/week-schedule.model.js';
import type { Lesson, Schedule, WeekLessons } from '@/src/types/schedule.js';
import { cacheService } from '@/src/services/cache.service.js';

export const scheduleService = {

    async create(data: WeekLessons) {
        await WeekScheduleModel.deleteOne({ weekTitle: data.weekTitle });

        const newData = new WeekScheduleModel(data);
        await newData.save();

        return `✅ Schedule for week ${data.weekTitle} created/updated`;
    },

    delete(weekTitleId: string) {
        return WeekScheduleModel.deleteOne({ weekTitleId });
    },

    async getScheduleBy(position: 'current' | 'next', param: 'teacherId' | 'groupId' | 'audienceId', value: string): Promise<Schedule | string> {
        const allowedParams = ['teacherId', 'groupId', 'audienceId'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }

        let weekSchedule = await WeekScheduleModel.findOne({ isCurrent: true });

        if (position === 'next') {
            const nextWeek = await WeekScheduleModel.findOne({
                startDate: { $gt: weekSchedule!.endDate },
            }).sort({ startDate: 1 });

            if (!nextWeek) {
                return '❌ Next week not found';
            }

            weekSchedule = nextWeek;
        }

        const filteredLessons = weekSchedule!.lessons.filter(
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

        if (param !== 'groupId') {
            const dayOrderMap: Record<string, number> = {
                'понедельник': 1,
                'вторник': 2,
                'среда': 3,
                'четверг': 4,
                'пятница': 5,
                'суббота': 6,
                'воскресенье': 7,
            };

            function getDayOrderKey(dayWithDate: string): number {
                const dayName = dayWithDate.split(' ')[0].toLowerCase();
                return dayOrderMap[dayName] || 99;
            }

            const ordered: Schedule = {};
            Object.keys(grouped)
                .sort((a, b) => getDayOrderKey(a) - getDayOrderKey(b))
                .forEach(day => {
                    ordered[day] = grouped[day];
                });
            return ordered;
        }

        return grouped;

    },

    async setCurrent(weekTitleId: string) {
        const doc = await WeekScheduleModel.findOne({ weekTitleId });
        if (!doc) {
            return `❌ Week with id ${weekTitleId} not found`;
        }

        if (doc.isCurrent) {
            return `❌ Week with id ${weekTitleId} is already current`;
        }

        const currentDoc = await WeekScheduleModel.findOne({ isCurrent: true });
        if (currentDoc) {
            currentDoc.isCurrent = false;
            await currentDoc.save();
        }
        doc.isCurrent = true;
        await doc.save();
        cacheService.clear();
    },

    async getAllScheduleTitles() {
        const docs = await WeekScheduleModel.find();
        return docs.map(doc => ({
            weekTitle: doc.weekTitle,
            weekTitleId: doc.weekTitleId,
            isCurrent: doc.isCurrent,
        }));
    },

};