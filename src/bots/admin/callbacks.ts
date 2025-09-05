import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { mainKeyboard } from '@/src/bots/admin/keyboards/main.kb.js';
import { showWeekTitleList } from '@/src/bots/admin/menus/week-titles.menu.js';
import { icons } from '@/src/bots/admin/icons.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { SchedulePosition } from '@/src/types/schedule.js';
import { sendNextSchedule } from '@/src/bots/main/utils/notification.js';
import { botChatsService } from '@/src/database/bot/bot-chats.service.js';
import { cacheService } from '@/src/services/cache.service.js';
import { BotChat } from '@/src/types/bot.js';

export function registerAdminCallbacks(bot: Bot) {
    bot.callbackQuery('menu', async (ctx) => {
        await ctx.editMessageText(`🧑‍💻 Главное меню`, mainKeyboard);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('send_notification', async (ctx) => {
        const newSchedule = await scheduleService.getScheduleBy('new', 'none', '');

        if (typeof newSchedule !== 'string') {
            await ctx.editMessageText(
                `🧑Хотите отправить всем пользователям уведомления о следующем расписании ${icons['new']} ${newSchedule.weekTitle}? Сначала проверьте правильность его отображения в основном боте хотя-бы для нескольких параметров 🥺`,
                {
                    reply_markup: new InlineKeyboard().text('✅ Да', 'notification').text('❌ Нет', 'menu'),
                },
            );
        } else {
            await ctx.editMessageText(
                `Не найдено ни одного расписания со статусом ${icons['new']} "Новое расписание". Сначала установите статус нажав на кнопку "Настроить статус`,
                mainKeyboard,
            );
        }

        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('notification', async (ctx) => {
        await ctx.editMessageText('Отправка уведомлений о следующем расписании, пожалуйста, подождите...');
        const stats = await sendNextSchedule();
        await ctx.reply(`${JSON.stringify(stats)}`, mainKeyboard);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('check', async (ctx) => {
        const users = await botChatsService.getAll();

        const uniqueUsersSchedule = new Map<string, NonNullable<BotChat['schedule']>>();

        for (const user of users) {
            const schedule = user.schedule;
            if (!schedule || !schedule.key || !schedule.type || !schedule.normalizedValue) continue;

            const key = `${schedule.type}:${schedule.key}`;
            if (!uniqueUsersSchedule.has(key)) {
                uniqueUsersSchedule.set(key, schedule);
            }
        }

        for (const schedule of uniqueUsersSchedule.values()) {
            const images = await cacheService.getImage(schedule.type, schedule.key, 'new');
            if (images) {
                const mediaGroup = images.buffers.map((buf) => ({
                    type: 'photo' as const,
                    media: new InputFile(buf),
                    parse_mode: 'HTML' as const,
                }));

                await ctx.replyWithMediaGroup(mediaGroup);
            }
        }

        await ctx.reply(`Картинки сгенерированы`, mainKeyboard);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('stats', async (ctx) => {
        const users = await botChatsService.getAll();

        const total = users.length;
        const totalPrivate = users.filter((u) => u.chatType === 'private').length;
        const totalGroups = users.filter((u) => u.chatType !== 'private').length;

        // const allParams = new Set()
        //
        // users.forEach(u => {
        //     if (!allParams.has(u.schedule?.normalizedValue)) {
        //         allParams.add(u.schedule?.normalizedValue)
        //     }
        // })

        const allParamsWithCount = new Map<string, number>();

        users.forEach((u) => {
            const uParam = u.schedule?.normalizedValue;
            if (!uParam) return;

            allParamsWithCount.set(uParam, (allParamsWithCount.get(uParam) ?? 0) + 1);
        });

        const text = `<b>Всего чатов:</b> ${total}
<b>Всего приватных чатов:</b> ${totalPrivate}
<b>Всего групповых чатов:</b> ${totalGroups}

<b>Выбранные параметры:</b>
${Array.from(allParamsWithCount.entries())
    .map(([param, count]) => `${param}: <b>${count}</b>`)
    .join('\n')}
`;

        await ctx.editMessageText(text, mainKeyboard);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('upload_schedule', async (ctx) => {
        await ctx.editMessageText(`Пришлите мне новый файл с расписанием`, {
            reply_markup: new InlineKeyboard().text('🔙 Назад', 'menu'),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/list_+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, event] = data.split('_');

        const texts = {
            delete: 'Выберите расписание из списка для удаления.',
            position: 'Выберите расписание из списка для изменения его статуса.',
        };

        const appendedText = `\n
${icons['current']} - Текущее расписание, отображается по умолчанию
${icons['new']} - Новое (следующее) расписание, отображается по кнопке "Следующее расписание"
${icons['unset']} - Только что загруженное расписание без заданного статуса, нигде не отображается
${icons['old']} - Старое расписание, нигде не отображается`;

        const resultText = texts[event as 'delete' | 'position'] + appendedText;

        await showWeekTitleList(ctx, 0, event, resultText);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/select_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, event, weekId] = data.split('_');

        switch (event) {
            case 'position': {
                await ctx.editMessageText('Выберите статус', {
                    reply_markup: new InlineKeyboard()
                        .text(`${icons['new']} Новое`, `position_new_${weekId}`)
                        .text(`${icons['current']} Текущее`, `position_current_${weekId}`)
                        .text(`${icons['old']} Старое`, `position_old_${weekId}`)
                        .row()
                        .text('🔙 Назад', `menu`),
                });
                break;
            }
            case 'delete': {
                await scheduleService.delete(weekId);
                await showWeekTitleList(ctx, 0, event);
                break;
            }
        }
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/page_(position|delete)_\d+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const regex = /^page_(position|delete)_(.+)$/;
        const match = data.match(regex);

        if (!match) return;

        const event = match[1] as 'position' | 'delete';
        const page = Number(match[2].trim());

        await showWeekTitleList(ctx, page, event);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/position_.+/, async (ctx) => {
        const data = ctx.callbackQuery.data;
        const [, position, weekId] = data.split('_');

        await scheduleService.setSchedulePosition(weekId, position as SchedulePosition);

        await ctx.editMessageText('Статус успешно изменен', {
            reply_markup: new InlineKeyboard().text('🔙 Назад', `menu`),
        });
        await ctx.answerCallbackQuery();
    });
}
