type DayType = 'monday' | 'other' | 'saturday';

type CategoryType = 'juniors' | 'seniors';

const times = {
    seniors: {
        monday: {
            1: '09:20 - 10:40',
            2: '10:50 - 12:10',
            3: '12:50 - 14:10',
            4: '14:20 - 15:40',
            5: '15:50 - 17:10',
        },
        other: {
            1: '08:30 - 09:50',
            2: '10:00 - 11:20',
            3: '12:00 - 13:20',
            4: '13:30 - 14:50',
            5: '15:30 - 16:50',
            6: '17:00 - 18:20',
        },
        saturday: {
            1: '08:30 - 09:50',
            2: '10:00 - 11:20',
            3: '11:30 - 12:50',
            4: '13:00 - 14:20',
            5: '14:30 - 15:50',
        },
    },
    juniors: {
        monday: {
            1: '09:20 - 10:40',
            2: '10:50 - 12:10',
            3: '12:50 - 14:10',
            4: '14:20 - 15:40',
            5: '15:50 - 17:10',
        },
        other: {
            1: '08:30 - 09:50',
            2: '10:00 - 11:20',
            3: '12:00 - 13:20',
            4: '13:30 - 14:50',
            5: '15:30 - 16:50',
            6: '17:00 - 18:20',
        },
        saturday: {
            1: '08:30 - 09:50',
            2: '10:00 - 11:20',
            3: '11:30 - 12:50',
            4: '13:00 - 14:20',
            5: '14:30 - 15:50',
        },
    },
};

export function getTimeForLesson(lessonNumber: number, group: string, day: string) {
    const afterDash = group.split('-').pop() || '';
    const courseNumber = parseInt(afterDash[0]);
    const category: CategoryType = courseNumber <= 1 ? 'juniors' : 'seniors';

    let dayKey = day.split(' ')[0];
    if (dayKey.toLowerCase() === 'понедельник') {
        dayKey = 'monday';
    } else if (dayKey.toLowerCase() === 'суббота') {
        dayKey = 'saturday';
    } else {
        dayKey = 'other';
    }

    const daySchedule = times[category][dayKey as DayType];
    const time = daySchedule[lessonNumber as keyof typeof daySchedule];

    if (!time) return { start: '', end: '' };

    const [start, end] = time.split(' - ');
    return { start, end };
}
