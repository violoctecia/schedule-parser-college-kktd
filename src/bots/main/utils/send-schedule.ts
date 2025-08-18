import { InlineKeyboard, InputFile } from 'grammy';
import { ScheduleType } from '@/src/types/schedule.js';
import { MyContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';

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


export async function sendSchedule(ctx: MyContext, type: ScheduleType, value: string, position: 'current' | 'next' = 'current') {

    const list = await cacheService.getList(type);
    const normalizedValue = list.find(t => t.id === value)?.normalizedValue || value;
    const kb = new InlineKeyboard().text('🏠 Поменять выбор', 'select_flow_type');

    let keyboardItem: InlineKeyboard;
    if (position === 'current') {
        keyboardItem = new InlineKeyboard().text(
            `Следующее расписание ${normalizedValue} ⏭️`,
            `schedule_next_${type}_${value}`
        );
    } else {
        keyboardItem = new InlineKeyboard().text(
            `↩️ Текущее расписание ${normalizedValue}`,
            `schedule_current_${type}_${value}`
        );
    }

    const finalKb = new InlineKeyboard([
        ...keyboardItem.inline_keyboard,
        ...kb.inline_keyboard,
    ]);


    await ctx.editMessageText('Пару секунд, готовим расписание..');

    const buffers = await cacheService.getImage(type, value, position);

    if (!buffers) {
        await ctx.editMessageText(`❌ ${sendScheduleText[position][type]} <b>${normalizedValue}</b> не найдено`,
            {
                reply_markup: finalKb,
            });
        return;
    }

    await ctx.editMessageText('Еще немного...');

    if (buffers.length > 1) {
        const mediaGroup = buffers.map(buf => (
            {
                type: 'photo' as const,
                media: new InputFile(buf),
                parse_mode: 'HTML' as const,
            }));

        await ctx.replyWithMediaGroup(mediaGroup);
        await ctx.deleteMessage();
        await ctx.reply(`⬆️ ${sendScheduleText[position][type]} <b>${normalizedValue}</b>\n \n\nВаше расписание оказалось несколько больше, чем можно уместить в одно изображение, поэтому мы разделили его на несколько частей.`,
            {
                reply_markup: finalKb,
            },
        );

    } else {
        await ctx.replyWithPhoto(new InputFile(buffers[0]));

        await ctx.deleteMessage();
        await ctx.reply(`⬆️ ${sendScheduleText[position][type]} <b>${normalizedValue}</b>`,
            {
                reply_markup: finalKb,
            },
        );
    }
}