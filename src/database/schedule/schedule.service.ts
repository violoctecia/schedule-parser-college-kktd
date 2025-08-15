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

    async getScheduleBy(weekTitle: string, param: 'teacherId' | 'group' | 'name' | 'audience', value: string): Promise<Schedule | string> {
        const allowedParams = ['teacherId', 'group', 'name', 'audience'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }
        const weekSchedule = await WeekScheduleModel.findOne({ weekTitle });
        if (!weekSchedule) {
            return `❌ Week ${weekTitle} not found`;
        }

        const filteredLessons = weekSchedule.lessons.filter(
            lesson => lesson[param] === value
        );

        // Группируем по дням и по номерам пар
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

        // Сортируем дни и номера пар
        Object.keys(grouped).forEach(day => {
            const sortedByNumber: Record<number, Lesson[]> = {};
            Object.keys(grouped[day])
                .sort((a, b) => Number(a) - Number(b))
                .forEach(num => {
                    sortedByNumber[Number(num)] = grouped[day][Number(num)];
                });
            grouped[day] = sortedByNumber;
        });
        console.log(JSON.stringify(grouped, null, 2));
        return grouped;
    },

    async findAllByType(type: ScheduleType): Promise<string[]> {
        const weekSchedule = await WeekScheduleModel
            .findOne()
            .sort({ _id: -1 }); // берём последний добавленный документ
        if (!weekSchedule) {
            console.log(`❌ No one week not found`);
            return [] as string[];
        }
        return [
            ...new Set(
                weekSchedule.lessons
                    .map(l => l[type])
                    .filter(v => v && String(v).trim() !== '')
            )
        ];
    },

    async findAllTeachers(): Promise<{ teacherId: string; teacherNormalized: string }[]> {
        const weekSchedule = await WeekScheduleModel
            .findOne()
            .sort({ _id: -1 }); // берём последний добавленный документ

        if (!weekSchedule) {
            console.log(`❌ No one week not found`);
            return [];
        }

        const uniqueMap = new Map<string, { teacherId: string; teacherNormalized: string }>();

        for (const lesson of weekSchedule.lessons) {
            if (lesson.teacherId && lesson.teacherNormalized) {
                uniqueMap.set(lesson.teacherId, {
                    teacherId: lesson.teacherId,
                    teacherNormalized: lesson.teacherNormalized
                });
            }
        }

        return Array.from(uniqueMap.values())
            .sort((a, b) => a.teacherNormalized.localeCompare(b.teacherNormalized));
    }
};