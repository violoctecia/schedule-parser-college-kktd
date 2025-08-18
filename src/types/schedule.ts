export type TableData = Record<string, string>;
export type MergeMap = Map<string, string>;
export type CellInfo = {
    value: string;
    startAddress: string;
    endAddress: string;
    startCol: string;
    startRow: number;
};

export type Lesson = {
    name: string;
    subgroup?: number;
    number: number;
    day: string;
    weekTitle: string;
    isFullDay?: boolean;

    teacher: string;
    teacherNormalized: string;
    teacherId: string;

    audience: string;
    audienceId: string;

    group: string;
    groupId: string;
}

export type WeekLessons = {
    lessons: Lesson[];
    weekTitle: string;
    weekTitleId: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
}

export type ScheduleType = 'group' | 'teacher' | 'audience';

export type DayLessons = Record<number, Lesson[]>
export type Schedule = Record<string, DayLessons>

