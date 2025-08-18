import { ScheduleType } from '@/src/types/schedule.js';

export type Key = {
    normalizedValue: string;
    id: string;
}
export type Keys = {
    type: ScheduleType;
    list: Key[];
}