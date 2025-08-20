import { InlineKeyboard, InputFile } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';
import { UserContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';

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

    let kbRememberItem;
    if (ctx.session.rememberedSchedule) {
        kbRememberItem = new InlineKeyboard().text(
            `🔕 Забыть выбор`,
            `forgot`,
        );
    } else {
        kbRememberItem = new InlineKeyboard().text(
            `🔔 Запомнить выбор`,
            `remember`,
        );
    }
    const kb = new InlineKeyboard().text('🏠 Поменять выбор', 'select_flow_type');

    let keyboardItem: InlineKeyboard;
    if (position === 'current') {
        keyboardItem = new InlineKeyboard().text(
            `Следующее расписание ⏭️`,
            `schedule_next_${type}_${value}`,
        );
    } else {
        keyboardItem = new InlineKeyboard().text(
            `⏮️ Текущее расписание `,
            `schedule_current_${type}_${value}`,
        );
    }

    const finalKb = new InlineKeyboard([
        ...keyboardItem.inline_keyboard,
        ...kbRememberItem.inline_keyboard,
        ...kb.inline_keyboard,
    ]);


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