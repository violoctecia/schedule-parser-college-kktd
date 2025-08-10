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

