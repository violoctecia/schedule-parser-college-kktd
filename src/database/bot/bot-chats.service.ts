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

        const chatFromDb = await BotChatsModel.findOneAndUpdate(
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

        if (chatFromDb.schedule) {
            ctx.session.rememberedSchedule = {
                type: chatFromDb.schedule.type,
                normalizedValue: chatFromDb.schedule.normalizedValue,
                key: chatFromDb.schedule.key,
            };
        }

        return chatFromDb;
    },

    async setSchedule(ctx: UserContext) {
        return BotChatsModel.updateOne(
            { chatId: ctx.chatId },
            {
                $set: {
                    schedule: ctx.session.rememberedSchedule
                        ? {
                              type: ctx.session.rememberedSchedule.type,
                              normalizedValue: ctx.session.rememberedSchedule.normalizedValue,
                              key: ctx.session.rememberedSchedule.key,
                          }
                        : null,
                },
            },
            { upsert: true },
        );
    },

    async getAll(): Promise<BotChat[]> {
        return BotChatsModel.find().lean();
    },
};
