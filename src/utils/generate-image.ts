import { createCanvas } from 'canvas';
import { Lesson } from '@/src/types/schedule.ts';
import { formatText } from '@/src/utils/format-text.ts';

export async function generateImage(data: Record<string, Lesson[]>): Promise<Buffer> {
    const scale = 3; // увеличиваем для Retina
    const width = 800 * scale;
    const height = 600 * scale;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Масштабируем координаты
    ctx.scale(scale, scale);

    const baseWidth = width / scale;
    const baseHeight = height / scale;

    // Фон
    ctx.fillStyle = "#F2F1ED";
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Настройки текста
    ctx.fillStyle = '#161616';
    ctx.font = '16px Roboto';

    const weekDays = Object.keys(data);

    // Заголовок недели по центру
    ctx.textAlign = 'center';
    ctx.fillText(data[weekDays[0]][0].weekTitle, baseWidth / 2, 20);

    ctx.textAlign = 'start';

    // Координаты для столбцов
    const columnX = [10, baseWidth / 2 + 10]; // левый и правый столбец
    const columnYStart = 60;
    const maxDaysInFirstColumn = 3;

    let colIndex = 0;
    let y = columnYStart;

    weekDays.forEach((day, index) => {
        // Переключаемся на второй столбец
        if (index === maxDaysInFirstColumn) {
            colIndex = 1;
            y = columnYStart;
        }

        ctx.font = 'bold 16px Roboto';
        ctx.fillText(formatText(day), columnX[colIndex], y);
        y += 20;

        ctx.font = '14px Roboto';
        for (const lesson of data[day]) {
            ctx.fillText(
                `${lesson.number}. ${lesson.name} ${lesson.subgroup ? `(${lesson.subgroup})` : ''}`,
                columnX[colIndex] + 10,
                y
            );
            ctx.fillText(
                `${lesson.teacherNormalized}. ${lesson.audience} ${lesson.group}`,
                columnX[colIndex] + 10,
                y+14
            );
            y += 35;
        }
        y += 10; // отступ между днями
    });

    return canvas.toBuffer('image/png');
}
