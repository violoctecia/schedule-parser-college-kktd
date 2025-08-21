import { SchedulePosition } from '@/src/types/schedule.js';

export const icons: Record<SchedulePosition, string> = {
    new: '🆕',
    current: '🟢',
    old: '🟡',
    unset: '⚪️',
};