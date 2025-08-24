import { createCanvas, CanvasRenderingContext2D, registerFont } from 'canvas';
import { Lesson, Schedule, ScheduleType, DayLessons } from '@/src/types/schedule.js';
import { formatText } from '@/src/utils/format-text.js';
import { getTimeForLesson } from '@/src/utils/lesson-time.js';
import path from 'path';

const cfg = {
    backgroundColor: '#dedede',
    dayBackgroundColor: '#fffffd',
    textColor: '#050505',
    secondTextColor: '#757573',
    lineColor: 'rgba(5, 5, 5, 0.1)',
    borderRadius: 12,
    scale: 3, // for Retina
};

const fontPath = path.resolve(__dirname, '../fonts/Arial.ttf');
registerFont(fontPath, { family: 'Arial' });

function calcDayHeight(day: DayLessons) {
    let height = 0;

    const numbersOfLessons = Object.keys(day).map(Number);
    numbersOfLessons.forEach((key) => {
        const lessons = day[key];
        lessons.forEach(() => {
            height += 16; // предмет + подгруппа
            height += 2;
            height += 14; // преподаватель / группа
        });

        if (lessons.length > 1) {
            height += (lessons.length - 1) * 2;
        }
    });

    if (numbersOfLessons.length > 1) {
        height += (numbersOfLessons.length - 1) * 16;
    }

    height += 16; // паддинги у дня
    return height;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function setText(ctx: CanvasRenderingContext2D, font: string, color?: string, align?: CanvasTextAlign, baseline?: CanvasTextBaseline) {
    ctx.font = font;
    ctx.fillStyle = color || cfg.secondTextColor;
    ctx.textAlign = align || 'start';
    ctx.textBaseline = baseline || 'top';
}

export async function generateImage(data: Schedule, type: ScheduleType): Promise<Buffer> {
    const weekDays = Object.keys(data);

    function calcImageHeight() {
        let totalHeight = 0;

        for (const dayKey of weekDays) {
            const dayLessons = data[dayKey];
            totalHeight += calcDayHeight(dayLessons) + 24 + 8;
        }

        return totalHeight + 30 + 10;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getFirstValue(obj: Record<any, any>) {
        return obj[Object.keys(obj)[0]];
    }

    const width = 800 * cfg.scale;
    const height = calcImageHeight() * cfg.scale;

    const canvas = createCanvas(width, height);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    ctx.scale(cfg.scale, cfg.scale);

    const baseWidth = width / cfg.scale;
    const baseHeight = height / cfg.scale;

    // Фон
    ctx.fillStyle = cfg.backgroundColor;
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    const param = getFirstValue(getFirstValue(data))[0][type === 'teacher' ? 'teacherNormalized' : type];

    setText(ctx, '12px Arial', cfg.textColor, 'start', 'top');
    ctx.fillText(param + ' ', 20, 10);

    const titleParamWidth = ctx.measureText(param + ' ').width;
    setText(ctx, '12px Arial', cfg.secondTextColor, 'start', 'top');
    ctx.fillText(getFirstValue(getFirstValue(data))[0].weekTitle, 20 + titleParamWidth, 10);

    setText(ctx, '12px Arial', cfg.secondTextColor, 'right');
    ctx.fillText('Ауд.', baseWidth - 30, 35); // аудитория

    function generateLessons(lessons: Lesson[], numberOfLesson: number, startY: number): number {
        let currentY = startY;

        const time = getTimeForLesson(numberOfLesson, lessons[0].group, lessons[0].day);
        setText(ctx, '14px Arial', cfg.secondTextColor, 'center');
        ctx.fillText(time.start, 80, currentY + 0.5); // время
        ctx.fillText(time.end, 80, currentY + 18);

        setText(ctx, '16px Arial', cfg.textColor, 'start');
        ctx.fillText(numberOfLesson.toString() + '.', 40, currentY); // номер пары

        lessons.forEach((lesson, index) => {
            setText(ctx, '16px Arial', cfg.textColor, 'start');
            ctx.fillText(`${lesson.name}${lesson.subgroup ? ` - ${lesson.subgroup} подгруппа` : ''}`, 110, currentY - 1, baseWidth - 66 - 90); // предмет + подгруппа

            currentY += 0.5;
            setText(ctx, '14px Arial', cfg.secondTextColor, 'right');
            ctx.fillText(lesson.audience === "'" ? ' ' : lesson.audience || ' ', baseWidth - 30, currentY); // аудитория

            currentY += 16;

            let groupWidth = 0;
            if (type === 'teacher' || type === 'audience') {
                setText(ctx, '14px Arial', cfg.secondTextColor, 'start');
                ctx.fillText(lesson.group + ' - ', 110, currentY);
                groupWidth = ctx.measureText(lesson.group).width + 16;
            }

            setText(ctx, '14px Arial', cfg.secondTextColor, 'start');
            ctx.fillText(lesson.teacher, 110 + groupWidth, currentY); // группа / преподователь

            if (index < lessons.length - 1) {
                currentY += 18;
            }
        });

        return currentY + 8 + 14;
    }

    function generateDay(day: DayLessons, startY: number) {
        setText(ctx, '16px Arial', cfg.textColor, 'start', 'top');
        ctx.fillText(formatText(getFirstValue(day)[0].day), 20, startY + 1); // день недели

        let currentY = startY + 24;
        const lessonsKeys = Object.keys(day).map(Number);
        const dayHeight = calcDayHeight(day);

        drawRoundedRect(ctx, 20, currentY, baseWidth - 40, dayHeight, cfg.borderRadius, cfg.dayBackgroundColor);

        let newY = currentY + 8;
        lessonsKeys.forEach((key, index) => {
            if (day[key][0].isFullDay) {
                currentY += 12;
                setText(ctx, '14px Arial', cfg.secondTextColor, 'center');
                ctx.fillText(day[key][0].name || 'Пустой день', baseWidth / 2, currentY + 5);
            } else {
                newY = generateLessons(day[key], key, newY);

                if (index < lessonsKeys.length - 1) {
                    const lineY = newY;
                    ctx.strokeStyle = 'rgba(5, 5, 5, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(30, lineY);
                    ctx.lineTo(baseWidth - 30, lineY);
                    ctx.stroke();
                }
            }

            newY += 8;
        });

        return dayHeight + 24 + 8;
    }

    let currentY = 30;
    for (const dayKey of weekDays) {
        const dayLessons = data[dayKey];
        currentY += generateDay(dayLessons, currentY);
    }

    return canvas.toBuffer('image/png');
}
