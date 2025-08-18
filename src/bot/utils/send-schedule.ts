import { ScheduleType } from '@/src/types/schedule.js';
import { MyContext } from '@/src/types/bot.js';
import { cacheService } from '@/src/services/cache.service.js';
import { InlineKeyboard, InputFile } from 'grammy';
import { sendScheduleText } from '@/src/bot/texts.js';


export async function sendSchedule(ctx: MyContext, type: ScheduleType, value: string) {
    await ctx.editMessageText('Пару секунд, готовим расписание..');
    const list = await cacheService.getList(type);

    const buffers = await cacheService.getImage(type, value);
    value = list.find(t => t.id === value)?.normalizedValue || value;

    if (!buffers) {
        await ctx.editMessageText('❌ Кажется мы не смогли найти расписание для вашего запроса',
            {
                reply_markup: new InlineKeyboard().text('Вернуться к выбору', 'back_to_select_menu'),
            });
        return;
    }

    await ctx.editMessageText('Еще немного...');

    if (buffers.length > 1) {
        const mediaGroup = buffers.map((buf, idx) => (
            {
                type: 'photo' as const,
                media: new InputFile(buf),
                parse_mode: 'HTML' as const,
            }));

        await ctx.replyWithMediaGroup(mediaGroup);
        await ctx.deleteMessage();
        await ctx.reply(`⬆️ ${sendScheduleText[type]} <b>${value}</b>\nс 23.01.2025 г. по 30.06.2025 г.\n\nВаше расписание оказалось несколько больше, чем можно уместить в одно изображение, поэтому мы разделили его на несколько частей.`,
            {
                reply_markup: new InlineKeyboard().text('Вернуться к выбору', 'back_to_select_menu'),
            });

    } else {
        await ctx.replyWithPhoto(new InputFile(buffers[0]),
            {
                caption: `${sendScheduleText[type]} <b>${value}</b>\nс 23.01.2025 г. по 30.06.2025 г.`,
                reply_markup: new InlineKeyboard().text('Вернуться к выбору', 'back_to_select_menu'),
            });

        await ctx.deleteMessage();
    }
}