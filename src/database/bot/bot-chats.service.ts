import { BotChatsModel } from '@/src/database/bot/bot-chats.model.js';
import { BotChat, UserContext } from '@/src/types/bot.js';

export const botChatsService = {

    async synchronize(ctx: UserContext): Promise<BotChat | null> {
        if (!ctx.chatId || !ctx.chat) return null;

        const chat: BotChat = {
            chatId: ctx.chatId,
            chatType: ctx.chat.type,
            schedule: null,
        };

        if (chat.chatType === 'private') {
            chat.firstName = ctx.from?.first_name || '';
            chat.lastName = ctx.from?.last_name || '';
            chat.username = ctx.from?.username || '';
        } else {
            chat.chatTitle = ctx.chat.title;
        }

        return BotChatsModel.findOneAndUpdate(
            { chatId: chat.chatId },
            {
                $set: {
                    firstName: chat.firstName,
                    lastName: chat.lastName,
                    username: chat.username,
                    chatTitle: chat.chatTitle,
                    chatType: chat.chatType,
                },
            },
            { upsert: true, new: true },
        );
    },

    async setSchedule(ctx: UserContext) {
        if (!ctx.session.rememberedSchedule) return;

        return BotChatsModel.updateOne(
            { chatId: ctx.chatId },
            {
                $set: {
                    schedule: {
                        type: ctx.session.rememberedSchedule.type,
                        value: ctx.session.rememberedSchedule.normalizedValue,
                        valueId: ctx.session.rememberedSchedule.key,
                    },
                },
            },
            { upsert: true },
        );

    },

    // async sync(ctx: UserContext) {
    //     if (!ctx.chatId) return;
    //
    //     const user: BotUser = {
    //         chatId: ctx.chatId,
    //         firstName: ctx.from?.first_name || '',
    //         lastName: ctx.from?.last_name || '',
    //         username: ctx.from?.username || '',
    //         selected: null,
    //     };
    //
    //     const existing = await BotChatsModel.findOne({ chatId: user.chatId });
    //
    //     if (existing) {
    //         existing.firstName = user.firstName;
    //         existing.lastName = user.lastName;
    //         existing.username = user.username;
    //         await existing.save();
    //         return existing;
    //     }
    //
    //     const newUser = new BotChatsModel(user);
    //     await newUser.save();
    //     return newUser;
    // },
    //
    // async setSelected(ctx: UserContext, type: ScheduleType, key: Key | null) {
    //     const existing = await BotChatsModel.findOne({ chatId: ctx.chatId });
    //     if (!existing) return;
    //
    //     if (!key) {
    //         existing.selected = null;
    //         await existing.save();
    //         return;
    //     }
    //
    //     existing.selected = { type, key };
    //     await existing.save();
    //     return;
    // },
};