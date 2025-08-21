type DayType = 'monday' | 'other';
type CategoryType = 'juniors' | 'seniors';

const times = {
    seniors: {
        monday: {
            1: "09:20 - 10:40",
            2: "11:30 - 12:50",
            3: "13:00 - 14:20",
            4: "14:30 - 15:50",
            5: "16:00 - 17:20"
        },
        other: {
            1: "08:30 - 09:50",
            2: "10:00 - 11:20",
            3: "12:05 - 13:25",
            4: "13:35 - 14:55",
            5: "15:05 - 16:25",
            6: "16:35 - 17:55"
        }
    },
    juniors: {
        monday: {
            1: "09:20 - 10:40",
            2: "11:30 - 12:50",
            3: "13:00 - 14:20",
            4: "14:30 - 15:50",
            5: "16:00 - 17:20"
        },
        other: {
            1: "08:30 - 09:50",
            2: "10:00 - 12:00",
            3: "12:25 - 13:25",
            4: "13:35 - 14:55",
            5: "15:05 - 16:25",
            6: "16:35 - 17:55"
        }
    }
}

export function getTimeForLesson(lessonNumber: number, group: string, day: string) {
    const afterDash = group.split('-').pop() || '';
    const courseNumber = parseInt(afterDash[0]);
    const category: CategoryType = courseNumber <= 1 ? 'juniors' : 'seniors';

    let dayKey = day.split(' ')[0];
    if (dayKey.toLowerCase() === 'понедельник') {
        dayKey = 'monday';
    } else {
        dayKey = 'other';
    }

    const daySchedule = times[category][dayKey as DayType];
    const time = daySchedule[lessonNumber as keyof typeof daySchedule];

    if (!time) return { start: '', end: '' };

    const [start, end] = time.split(' - ');
    return { start, end };
}
