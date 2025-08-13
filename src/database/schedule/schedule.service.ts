import { WeekScheduleModel } from '@/src/database/schedule/week-schedule.model.ts';
import type { Lesson, ScheduleType, WeekLessons } from '@/src/types/schedule.ts';

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

    async searchBy(weekTitle: string, param: 'teacherId' | 'group' | 'name' | 'audience', value: string) {
        const allowedParams = ['teacherId', 'group', 'name', 'audience'];
        if (!allowedParams.includes(param)) {
            return `❌ Invalid param ${param}`;
        }
        const weekSchedule = await WeekScheduleModel.findOne({ weekTitle });
        if (!weekSchedule) {
            return `❌ Week ${weekTitle} not found`;
        }
        const result = weekSchedule.lessons.filter(lesson => lesson[param] === value);

        const newObj: Record<string, Lesson[]> = {};

        result.forEach(lesson => {
            if (!newObj[lesson.day]) {
                newObj[lesson.day] = [];
            }
            newObj[lesson.day].push(lesson);
        });

        return newObj;
    },

    async findAllByType(type: ScheduleType): Promise<string[]> {
        const weekSchedule = await WeekScheduleModel
            .findOne()
            .sort({ _id: -1 }); // берём последний добавленный документ
        if (!weekSchedule) {
            console.log(`❌ No one week not found`);
            return [] as string[];
        }
        return [...new Set(weekSchedule.lessons.map(l => l[type]))]
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