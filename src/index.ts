import tableService from '@/src/services/table-service.ts';
import { initDatabase } from '@/src/database/index.ts';
import { startBot } from '@/src/bot/index.ts';

initDatabase();
startBot();

// tableService.load('uploads/example.xlsx');

// @ts-ignore
import express from 'express';
import { generateImage } from '@/src/utils/generate-image.js';
const app = express();

const testData = {
    'ПОНЕДЕЛЬНИК 23.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'ПОНЕДЕЛЬНИК 23.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'ПОНЕДЕЛЬНИК 23.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'ПОНЕДЕЛЬНИК 23.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'ВТОРНИК 24.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'ВТОРНИК 24.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'ВТОРНИК 24.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'ВТОРНИК 24.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'СРЕДА 25.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'СРЕДА 25.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'СРЕДА 25.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'СРЕДА 25.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'ЧЕТВЕРГ 26.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'ЧЕТВЕРГ 26.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'ЧЕТВЕРГ 26.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'ЧЕТВЕРГ 26.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'ПЯТНИЦА 27.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'ПЯТНИЦА 27.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'ПЯТНИЦА 27.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'ПЯТНИЦА 27.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'СУББОТА 28.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'СУББОТА 28.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'СУББОТА 28.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'СУББОТА 28.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ],
    'ПОНЕДЕЛЬНИК 30.06.2025': [
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 1,
            day: 'ПОНЕДЕЛЬНИК 30.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 2,
            day: 'ПОНЕДЕЛЬНИК 30.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        },
        {
            name: 'ПП.08',
            teacher: 'Деркунов М.Ю. Производственная практика.',
            teacherNormalized: 'Деркунов М.Ю.',
            teacherId: 'деркуновмю',
            audience: "' ",
            group: '09.02.07-3В',
            number: 3,
            day: 'ПОНЕДЕЛЬНИК 30.06.2025',
            weekTitle: 'с 23.01.2025 г. по 30.06.2025 г.',
            isFullDay: false,
        }
    ]
}

// @ts-ignore
app.get('/', async (req, res) => {
    const buffer = await generateImage(testData);
    console.log('Размер картинки:', (buffer.length / 1024).toFixed(2), 'KB');

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000/');
});