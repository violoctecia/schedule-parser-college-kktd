import { BotUserModel, BotUser } from '@/src/database/bot/bot-user.model.ts';
import { Context } from 'grammy';

export const botUserService = {

    async sync(ctx: Context, type?: string, value?: string) {
        if (!ctx.from) return;

        const filter = { userId: ctx.from.id };
        const update: BotUser = {
            userId: ctx.from.id,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name || '',
            username: ctx.from.username || '',
        };

        const options = { upsert: true, new: true };

        if (type !== undefined) update.pickedType = type;
        if (value !== undefined) update.pickedValue = value;

        return BotUserModel.findOneAndUpdate(
            filter,
            { $set: update },
            options
        );
    }
};