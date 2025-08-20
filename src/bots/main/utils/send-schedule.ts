import { InputFile } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';
import { UserContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { scheduleKb } from '@/src/bots/main/utils/schedule.kb.js';

const sendScheduleText = {
    current: {
        'group': 'Текущее расписание группы',
        'teacher': 'Текущее расписание для',
        'audience': 'Текущее расписание занятий с аудиторией',
    },
    next: {
        'group': 'Следующее расписание группы',
        'teacher': 'Следующее расписание для',
        'audience': 'Следующее расписание занятий с аудиторией',
    },
};


export async function sendSchedule(ctx: UserContext, type: ScheduleType, value: string, position: 'current' | 'next' = 'current', isCallback: boolean = true) {

    let sent;
    if (isCallback) {
        await ctx.editMessageText('Пару секунд, готовим расписание..');
    } else {
        sent = await ctx.reply('Пару секунд, готовим расписание..');
    }

    const list = await cacheService.getList(type);
    const normalizedValue = list.find(t => t.id === value)?.normalizedValue || value;

    ctx.session.isSelecting = false;
    ctx.session.currentSchedule = {
        type: type,
        key: value,
        normalizedValue: normalizedValue,
    };

    const finalKb = scheduleKb(ctx, position, type, value);

    const deleteMessage = async () => {
        if (isCallback) {
            await ctx.deleteMessage();
        } else {
            await ctx.api.deleteMessage(sent!.chat.id, sent!.message_id);
        }
    };

    const images = await cacheService.getImage(type, value, position);

    if (!images) {
        await deleteMessage();
        await ctx.reply(`❌ ${sendScheduleText[position][type]} <b>${normalizedValue}</b> не найдено`,
            {
                reply_markup: finalKb,
            });
        return;
    }

    if (isCallback) {
        await ctx.editMessageText('Еще немного...');
    } else {
        await ctx.api.editMessageText(sent!.chat.id, sent!.message_id, 'Еще немного...');
    }


    const mediaGroup = images.buffers.map(buf => (
        {
            type: 'photo' as const,
            media: new InputFile(buf),
            parse_mode: 'HTML' as const,
        }));

    await deleteMessage();

    await ctx.replyWithMediaGroup(mediaGroup);
    await ctx.reply(`⬆️ ${sendScheduleText[position][type]} <b>${normalizedValue}</b> ${images.weekTitle}`,
        {
            reply_markup: finalKb,
        },
    );
}