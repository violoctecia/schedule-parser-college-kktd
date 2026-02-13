import { InputFile } from 'grammy';
import { SchedulePosition, ScheduleType } from '@/src/types/schedule.js';
import { UserContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleKb } from '@/src/bots/main/keyboards/schedule.kb.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';

const sendScheduleText: Record<Extract<SchedulePosition, 'current' | 'new'>, Record<ScheduleType, string>> = {
    current: {
        group: 'Текущее расписание группы',
        teacher: 'Текущее расписание для',
        audience: 'Текущее расписание занятий с аудиторией',
    },
    new: {
        group: 'Следующее расписание группы',
        teacher: 'Следующее расписание для',
        audience: 'Следующее расписание занятий с аудиторией',
    },
};

export async function sendSchedule(
    ctx: UserContext,
    type: ScheduleType,
    value: string,
    position: Extract<SchedulePosition, 'current' | 'new'> = 'current',
    isCallback: boolean = true,
) {
    let sent;

    if (isCallback) {
        await ctx.editMessageText('Пару секунд, готовим расписание..');
    } else {
        sent = await ctx.reply('Пару секунд, готовим расписание..');
    }

    const list = await cacheService.getList(type);
    const normalizedValue = list.find((t) => t.id === value)?.normalizedValue || value;

    ctx.session.isSelecting = false;
    ctx.session.currentSchedule = {
        type: type,
        key: value,
        normalizedValue: normalizedValue,
    };

    const isGroupChat = ctx.chat?.type !== 'private';
    if (isGroupChat) {
        ctx.session.rememberedSchedule = {
            type: type,
            key: value,
            normalizedValue: normalizedValue,
        };
        await botChatsService.setSchedule(ctx);
    }

    const finalKb = scheduleKb(ctx, position, type, value);

    const deleteMessage = async () => {
        if (isCallback) {
            try {
                await ctx.deleteMessage();
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                await ctx.api.deleteMessage(sent!.chat.id, sent!.message_id);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const images = await cacheService.getImage(type, value, position);
    console.log('[sendSchedule] getImage done, hasImages:', !!images, images?.buffers?.length ?? 0);

    if (isCallback) {
        await ctx.editMessageText('Еще немного...');
    } else {
        await ctx.api.editMessageText(sent!.chat.id, sent!.message_id, 'Еще немного...');
    }

    if (!images) {
        await deleteMessage();
        const text = `❌ ${sendScheduleText[position][type]} <b>${normalizedValue}</b> не найдено. ${isGroupChat ? 'Бот автоматически пришлет его в этот чат, как только оно появится' : ''}`;

        await ctx.reply(text, isGroupChat ? {} : { reply_markup: finalKb });
        return;
    }

    const mediaGroup = images.buffers.map((buf) => ({
        type: 'photo' as const,
        media: new InputFile(buf),
        parse_mode: 'HTML' as const,
    }));

    console.log('[sendSchedule] sending mediaGroup, parts:', mediaGroup.length);
    try {
        await ctx.replyWithMediaGroup(mediaGroup);
        console.log('[sendSchedule] replyWithMediaGroup ok');
    } catch (err) {
        console.error('[sendSchedule] replyWithMediaGroup failed:', err);
        throw err;
    }
    const text = `☝️ ${sendScheduleText[position][type]} <b>${normalizedValue}</b> ${images.weekTitle}`;

    await ctx.reply(text, isGroupChat ? {} : { reply_markup: finalKb });
    await deleteMessage();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    console.log(
        `Image with param ${normalizedValue} ${position} delivered to ${ctx.chat?.username ? `@${ctx.chat?.username}` : ctx.chat?.title} ${ctx.chat?.id} at ${day}.${month}.${year} ${hours}:${minutes}`,
    );
}
