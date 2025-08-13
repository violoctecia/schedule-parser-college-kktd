import { Context, SessionFlavor } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';

export interface SessionData {

}

export type MyContext = Context & SessionFlavor<SessionData>;