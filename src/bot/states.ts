import { Context } from 'grammy';

const userStates = new Map<number, string>();

export const UserStates = {

    get(ctx: Context): string | undefined {
        const userId = ctx.from?.id;
        if (!userId) return undefined;
        return userStates.get(userId);
    },


    set(ctx: Context, state: string) {
        const userId = ctx.from?.id;
        if (!userId) return;
        userStates.set(userId, state);
    },


    delete(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;
        userStates.delete(userId);
    },
};
