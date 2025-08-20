import { Context, SessionFlavor } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';

export type ScheduleInfo = {
    type: ScheduleType;
    normalizedValue?: string; // нормализованное значение
    key?: string;           // ID ключа
}

export interface UserSessionData {
    isSelecting: boolean;
    rememberedSchedule: Required<ScheduleInfo> | null;
    currentSchedule: ScheduleInfo | null;
}

export type UserContext = Context & SessionFlavor<UserSessionData>;

export type BotChat = {
    chatId: number; // уникальный ID чата
    chatType: 'private' | 'group' | 'supergroup' | 'channel';

    // --- для private (пользователей) ---
    firstName?: string;
    lastName?: string;
    username?: string;

    // --- для групп/каналов ---
    chatTitle?: string;

    // --- выбранное расписание для этого чата ---
    schedule: Required<ScheduleInfo> | null;
};