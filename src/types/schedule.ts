import type { Range } from 'xlsx';

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

