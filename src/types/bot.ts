import { Context, SessionFlavor } from 'grammy';

export interface SessionData {

}

export type MyContext = Context & SessionFlavor<SessionData>;

export interface AdminSessionData {
    step: string;
}

export type AdminContext = Context & SessionFlavor<AdminSessionData>;