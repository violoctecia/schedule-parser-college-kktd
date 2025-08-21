import { WeekScheduleModel } from '@/src/database/schedule/week-schedule.model.js';
import { Lesson, Schedule, SchedulePosition, WeekLessons } from '@/src/types/schedule.js';
import { cacheService } from '@/src/services/cache.service.js';

export const scheduleService = {

    async create(data: WeekLessons) {
        await WeekScheduleModel.deleteOne({ weekTitle: data.weekTitle });

        const newData = new WeekScheduleModel(data);
        await newData.save();

        return `✅ Schedule for week ${data.weekTitle} created/updated`;
    },

    async delete(weekTitleId: string) {
        const res = await WeekScheduleModel.deleteOne({ weekTitleId });
        console.log('Deleted count:', res.deletedCount);
        return res;
    },

    async getScheduleBy(position: SchedulePosition, param: 'teacherId' | 'groupId' | 'audienceId', value: string): Promise<Schedule | string> {
        const allowedParams = ['teacherId', 'groupId', 'audienceId'];

        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }

        let weekSchedule = await WeekScheduleModel.findOne({ position });
        if (!weekSchedule) {
            return `❌ WeekSchedule with position ${position} not found`;
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

    // Задать позицию для расписания, если задать позицию как текущую, то старая устанавливается в 'old'
    async setSchedulePosition(weekTitleId: string, position: SchedulePosition) {
        const doc = await WeekScheduleModel.findOne({ weekTitleId });
        if (!doc) {
            return `❌ Week with id ${weekTitleId} not found`;
        }

        if (position === 'current') {
            const currentDoc = await WeekScheduleModel.findOne({ position });
            if (currentDoc) {
                currentDoc.position = 'old';
                await currentDoc.save();
            }
        }

        doc.position = position;
        await doc.save();
        cacheService.clear();
    },

    async getAllScheduleTitles() {
        const docs = await WeekScheduleModel.find();
        return docs.map(doc => ({
            weekTitle: doc.weekTitle,
            weekTitleId: doc.weekTitleId,
            position: doc.position,
        }));
    },

};