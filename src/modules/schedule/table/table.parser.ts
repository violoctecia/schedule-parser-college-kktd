import type { Lesson, CellInfo } from '@/src/types/schedule.ts';
import { CellInfoService } from '@/src/modules/schedule/table/table.cellInfo.ts';

export class TableParser {
    constructor(
        private cellInfoService: CellInfoService,
        public weekTitle: string,
        private lessonNumbersCol: string,
    ) {}

    parseDayLessonsFromGroup(day: CellInfo, group: CellInfo): Lesson[] {
        const lessons: Lesson[] = [];

        // Проверка на полный день
        if (
            this.cellInfoService.getCellInfo(`${group.startCol}${day.startRow}`, 0, 0)?.startAddress ===
            this.cellInfoService.getCellInfo(`${group.startCol}${day.startRow}`, 3, 7)?.startAddress
        ) {
            return [{
                number: 1,
                group: group.value,
                name: this.cellInfoService.getCellInfo(`${group.startCol}${day.startRow}`, 0, 0)?.value || '',
                teacher: '',
                audience: '',
                day: day.value,
                weekTitle: this.weekTitle,
                isFullDay: true,
            }];
        }

        const dayEndRow = parseInt(day.endAddress.slice(1));
        let currentRow = day.startRow;
        const lessonNumbersPoints = [];

        while (currentRow < dayEndRow) {
            const lessonNum = this.cellInfoService.getCellInfo(`${this.lessonNumbersCol}${currentRow}`);
            if (lessonNum?.value) lessonNumbersPoints.push(lessonNum);
            currentRow++;
        }

        for (const lessonNum of lessonNumbersPoints) {
            const row = lessonNum.startRow;
            const baseLesson: Lesson = {
                number: Number(lessonNum.value),
                group: group.value,
                name: '',
                teacher: '',
                audience: '',
                day: day.value,
                weekTitle: this.weekTitle,
            };

            const subgroup1Lesson = this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 0, 0);
            const subgroup2Lesson = this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 2, 0);

            if (!subgroup1Lesson?.value && !subgroup2Lesson?.value) continue;

            if (subgroup1Lesson?.startAddress === subgroup2Lesson?.startAddress) {
                baseLesson.name = subgroup1Lesson?.value || '';
                baseLesson.teacher = this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 0, 1)?.value || '';
                baseLesson.audience = this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 3, 0)?.value || '';
                lessons.push(baseLesson);
            } else {
                lessons.push({
                    ...baseLesson,
                    name: subgroup1Lesson?.value || '',
                    teacher: this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 0, 1)?.value || '',
                    audience: this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 1, 0)?.value || '',
                    subgroup: 1,
                });
                lessons.push({
                    ...baseLesson,
                    name: subgroup2Lesson?.value || '',
                    teacher: this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 2, 1)?.value || '',
                    audience: this.cellInfoService.getCellInfo(`${group.startCol}${row}`, 3, 0)?.value || '',
                    subgroup: 2,
                });
            }
        }
        return lessons;
    }
}
