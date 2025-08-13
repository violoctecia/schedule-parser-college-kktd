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

    teacher: string;
    teacherNormalized: string;
    teacherId: string;

    audience: string;
    subgroup?: number;
    group: string;
    number: number;

    day: string;
    weekTitle: string;
    isFullDay?: boolean;
}

export type WeekLessons = {
    lessons: Lesson[];
    weekTitle: string;
}

export type ScheduleType = 'group' | 'teacher' | 'name' | 'audience';


