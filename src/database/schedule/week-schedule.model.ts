import mongoose, { Schema, Document } from 'mongoose';
import type { Lesson, WeekLessons } from '@/src/types/schedule.js';

interface ILesson extends Lesson, Document {}

interface IWeekLessons extends WeekLessons, Document {}

const LessonSchema = new Schema<ILesson>(
    {
        name: { type: String, default: '' },
        teacher: { type: String, default: '' },
        teacherNormalized: { type: String, default: '' },
        teacherId: { type: String, default: '' },
        audience: { type: String, default: '' },
        audienceId: { type: String, default: '' },
        subgroup: { type: Number },
        group: { type: String, required: true },
        groupId: { type: String, default: '' },
        number: { type: Number, required: true },
        day: { type: String, required: true },
        weekTitle: { type: String, required: true },
        isFullDay: { type: Boolean, default: false },
    },
    { _id: false },
);

const WeekScheduleSchema = new Schema<IWeekLessons>({
    lessons: { type: [LessonSchema], required: true },
    weekTitle: { type: String, required: true, unique: true },
    weekTitleId: { type: String, required: true, unique: true },
    position: { type: String, enum: ['current', 'new', 'old', 'unset'], default: 'unset' },
});

export const WeekScheduleModel = mongoose.model<IWeekLessons>('WeekSchedule', WeekScheduleSchema);
