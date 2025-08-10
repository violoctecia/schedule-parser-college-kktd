import XLSX from 'xlsx';

import type { Lesson, WeekLessons } from '@/src/types/schedule.ts';
import { scheduleService } from '@/src/database/services/scheduleService.ts';

type TableData = Record<string, string>;
type MergeMap = Map<string, string>;
type CellInfo = {
    value: string;
    startAddress: string;
    endAddress: string;
    startCol: string;
    startRow: number;
};

const startPoints = {
    groups: 'F10',
    weekDays: 'A12',
    lessonNumbersCol: 'B',
    subgroupsRow: 11,
    weekName: 'A6',
};

const tableService = {
    table: {} as TableData,
    mergedMap: new Map() as MergeMap,
    merges: [] as XLSX.Range[],
    filePath: null as string | null,
    groups: [] as CellInfo[],
    days: [] as CellInfo[],
    weekTitle: '',

    load(filePath: string) {
        console.log('✅ Start loading table from', filePath);
        this.filePath = filePath;

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        this.merges = sheet['!merges'] || [];

        this.mergedMap.clear();

        this.merges.forEach(({ s, e }) => {
            const startCell = XLSX.utils.encode_cell(s);
            for (let r = s.r; r <= e.r; r++) {
                for (let c = s.c; c <= e.c; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    this.mergedMap.set(addr, startCell);
                }
            }
        });

        this.table = {};
        const range = XLSX.utils.decode_range(sheet['!ref'] || '');

        for (let r = range.s.r; r <= range.e.r; r++) {
            for (let c = range.s.c; c <= range.e.c; c++) {
                const addr = XLSX.utils.encode_cell({ r, c });
                const masterAddr = this.mergedMap.get(addr) || addr;
                const cell = sheet[masterAddr];
                if (cell?.v !== undefined && cell.v !== null && cell.v !== '') {
                    this.table[addr] = cell.v;
                }
            }
        }

        const now = new Date();
        const formatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });

        this.weekTitle = this.cellInfo(startPoints.weekName, 0, 0)?.value || formatter.format(now);
        this.fullParse();
    },

    cellInfo(address: string, colOffset = 0, rowOffset = 0): CellInfo | null {
        const cell = XLSX.utils.decode_cell(address);
        cell.c = Math.max(0, cell.c + colOffset);
        cell.r = Math.max(0, cell.r + rowOffset);
        const newAddr = XLSX.utils.encode_cell(cell);

        const masterAddr = this.mergedMap.get(newAddr) || newAddr;
        const value = this.table[masterAddr];

        if (value === undefined) return null;

        let startAddress = newAddr;
        let endAddress = newAddr;
        let startCol = '';
        let startRow = 0;

        for (const merge of this.merges) {
            if (
                cell.c >= merge.s.c && cell.c <= merge.e.c &&
                cell.r >= merge.s.r && cell.r <= merge.e.r
            ) {
                startAddress = XLSX.utils.encode_cell(merge.s);
                endAddress = XLSX.utils.encode_cell(merge.e);

                startCol = XLSX.utils.encode_col(merge.s.c);
                startRow = merge.s.r + 1;
                break;
            }
        }

        if (!startCol) {
            startCol = XLSX.utils.encode_col(cell.c);
            startRow = cell.r + 1;
        }

        return { value, startAddress, endAddress, startCol, startRow };
    },

    findGroups() {
        let currentColOffset = 0;

        while (true) {
            const newGroup = this.cellInfo(startPoints.groups, currentColOffset, 0);
            if (!newGroup?.value) break;
            this.groups.push(newGroup);
            currentColOffset += 5;
        }
    },

    findDays() {
        let currentPoint = startPoints.weekDays;

        while (true) {
            const newDay = this.cellInfo(currentPoint, 0, 1);
            if (!newDay?.value) break;
            this.days.push(newDay);
            currentPoint = newDay.endAddress;
        }
    },

    parseDayLessonsFromGroup(day: CellInfo, group: CellInfo) {
        const lessons: Lesson[] = [];

        // Проверка на полный день
        // TODO: сейчас вычисление на полный день захардкодено, может сломаться если формат поменяется
        if (this.cellInfo(`${group.startCol}${day.startRow}`, 0, 0)?.startAddress === this.cellInfo(`${group.startCol}${day.startRow}`, 3, 7)?.startAddress) {
            const lesson: Lesson = {
                number: 1,
                group: group.value,
                name: this.cellInfo(`${group.startCol}${day.startRow}`, 0, 0)?.value || '',
                teacher: '',
                audience: '',
                day: day.value,
                weekTitle: this.weekTitle,
                isFullDay: true,
            };
            return [lesson];
        }

        // Если не полный день, проходимя по всем занятим в дне
        const dayEndRow = parseInt(day.endAddress.slice(1));
        let currentRow = day.startRow;
        const lessonNumbersPoints = [];

        while (true) {
            const newLessonNumber = this.cellInfo(`${startPoints.lessonNumbersCol}${currentRow}`, 0, 0);
            if (currentRow === dayEndRow) break;
            if (newLessonNumber?.value) {
                lessonNumbersPoints.push(newLessonNumber);
            }
            currentRow++;
        }

        lessonNumbersPoints.forEach(lessonNum => {
            const row = lessonNum.startRow;
            const lesson: Lesson = {
                number: Number(lessonNum.value),
                group: group.value,
                name: '',
                teacher: '',
                audience: '',
                day: day.value,
                weekTitle: this.weekTitle,
            };

            const subgroup1Lesson = this.cellInfo(`${group.startCol}${row}`, 0, 0);
            const subgroup2Lesson = this.cellInfo(`${group.startCol}${row}`, 2, 0);

            if (!subgroup1Lesson?.value && !subgroup2Lesson?.value) return;

            if (subgroup1Lesson?.startAddress === subgroup2Lesson?.startAddress) {
                // Одна подгруппа, один урок - пушим один объект
                lesson.name = subgroup1Lesson?.value || '';
                lesson.teacher = this.cellInfo(`${group.startCol}${row}`, 0, 1)?.value || '';
                lesson.audience = this.cellInfo(`${group.startCol}${row}`, 3, 0)?.value || '';
                lessons.push(lesson);
            } else {
                // Две подгруппы - создаём и пушим два отдельных урока
                const lesson1: Lesson = {
                    number: lesson.number,
                    group: lesson.group,
                    name: subgroup1Lesson?.value || '',
                    teacher: this.cellInfo(`${group.startCol}${row}`, 0, 1)?.value || '',
                    audience: this.cellInfo(`${group.startCol}${row}`, 1, 0)?.value || '',
                    subgroup: 1,
                    day: lesson.day,
                    weekTitle: lesson.weekTitle,
                };
                lessons.push(lesson1);

                const lesson2: Lesson = {
                    number: lesson.number,
                    group: lesson.group,
                    name: subgroup2Lesson?.value || '',
                    teacher: this.cellInfo(`${group.startCol}${row}`, 2, 1)?.value || '',
                    audience: this.cellInfo(`${group.startCol}${row}`, 3, 0)?.value || '',
                    subgroup: 2,
                    day: lesson.day,
                    weekTitle: lesson.weekTitle,
                };
                lessons.push(lesson2);
            }
        });
        return lessons;
    },

    async fullParse() {
        this.findGroups();
        this.findDays();

        const weekLessons: WeekLessons = {
            lessons: [],
            weekTitle: this.weekTitle,
        }

        const pairs = this.groups.flatMap(group =>
            this.days.map(day => ({ group, day }))
        );

        for (const { group, day } of pairs) {
            weekLessons.lessons.push(...this.parseDayLessonsFromGroup(day, group));
        }

        const result = await scheduleService.create(weekLessons)
        console.log(result);
        await scheduleService.searchBy(this.weekTitle, 'group', '09.02.07-4');
    },
};

export default tableService;
