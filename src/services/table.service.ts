import XLSX from 'xlsx';
import type { CellInfo, Lesson, MergeMap, ScheduleType, TableData, WeekLessons } from '@/src/types/schedule.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { normalizeTeacher } from '@/src/utils/normalize-teacher.js';
import { normalizeDate } from '@/src/utils/normalize-date.js';
import { Key } from '@/src/types/keys.js';
import { keysService } from '@/src/database/keys/keys.service.js';
import { cacheService } from '@/src/services/cache.service.js';

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

    groups: [] as CellInfo[],
    days: [] as CellInfo[],
    weekTitle: '',

    teacherKeys: [] as Key[],
    groupsKeys: [] as Key[],
    audienceKeys: [] as Key[],

    async load(filePath?: string, buffer?: Buffer): Promise<string> {
        console.log('✅ Start loading table', filePath ? 'from file' : 'from buffer');

        let workbook;
        if (filePath) {
            workbook = XLSX.readFile(filePath);
        } else if (buffer) {
            workbook = XLSX.read(buffer, { type: 'buffer' });
        } else {
            return 'Не передан filePath или buffer'
        }

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
        return await this.fullParse();
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

    async setId(value: unknown, type: Exclude<ScheduleType, 'teacher'>): Promise<Key> {
        if (typeof value !== 'string' && typeof value !== 'number') {
            return { normalizedValue: '', id: '' };
        }

        const str = value.toString().trim();
        if (!str || str === '\'') {
            return { normalizedValue: '', id: '' };
        }

        const newKey: Key = {
            normalizedValue: str,
            id: str.toLowerCase().replace(/[\s.-]/g, ''),
        };

        const keysArray =
            type === 'group'
                ? this.groupsKeys
                : this.audienceKeys;

        const foundExact = keysArray.find(i => i.id === newKey.id);
        if (foundExact) return foundExact;

        const res = await keysService.createKey(newKey.normalizedValue, newKey.id, type);
        if (res) {
            console.log(`Новый ключ для ${type}: `, res);
            keysArray.push(res);
            return res;
        }

        return newKey;
    },

    async setIdToTeacher(teacherOriginalName: string): Promise<Key> {
        if (!teacherOriginalName) return { normalizedValue: '', id: '' };
        const newKey: Key = {
            normalizedValue: normalizeTeacher(teacherOriginalName, true),
            id: normalizeTeacher(teacherOriginalName),
        };

        const foundExact = this.teacherKeys.find(i => i.id === newKey.id);
        if (foundExact) return foundExact;

        const res = await keysService.createKey(newKey.normalizedValue, newKey.id, 'teacher');
        if (res) {
            console.log('Новый ключ для преподователя: ', res);
            this.teacherKeys.push(res);
            return res;
        }

        return newKey;
    },

    async parseDayLessonsFromGroup(day: CellInfo, group: CellInfo) {
        const lessons: Lesson[] = [];
        const groupKey = await this.setId(group.value, 'group');

        const firstValue = this.cellInfo(`${group.startCol}${day.startRow}`, 0, 0);
        const secondValue = this.cellInfo(`${group.startCol}${day.startRow}`, 3, 1);
        // Проверка на полный день для группы, если день полный - учителя нет (ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ, и т.д.)

        if (firstValue?.startAddress && firstValue?.startAddress === secondValue?.startAddress) {
            const lesson: Lesson = {
                number: 1,
                group: group.value,
                groupId: groupKey.id,
                name: firstValue?.value || '',
                teacher: '',
                teacherNormalized: '',
                teacherId: '',
                audience: '',
                audienceId: '',
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

        for (const lessonNum of lessonNumbersPoints) {
            const row = lessonNum.startRow;
            let teacher;
            let teacherKey;
            let audience;
            let audienceKey;

            const lesson: Lesson = {
                number: Number(lessonNum.value),
                group: group.value,
                groupId: groupKey.id,
                name: '',
                teacher: '',
                teacherNormalized: '',
                teacherId: '',
                audience: '',
                audienceId: '',
                day: day.value,
                weekTitle: this.weekTitle,
            };

            const subgroup1Lesson = this.cellInfo(`${group.startCol}${row}`, 0, 0);
            const subgroup2Lesson = this.cellInfo(`${group.startCol}${row}`, 2, 0);

            if (!subgroup1Lesson?.value && !subgroup2Lesson?.value) continue;

            // Одна подгруппа, один урок - пушим один объект
            if (subgroup1Lesson?.startAddress === subgroup2Lesson?.startAddress) {
                teacher = this.cellInfo(`${group.startCol}${row}`, 0, 1)?.value || '';
                teacherKey = await this.setIdToTeacher(teacher);
                audience = this.cellInfo(`${group.startCol}${row}`, 3, 0)?.value || '';
                audienceKey = await this.setId(audience, 'audience');

                lesson.teacher = teacher;
                lesson.teacherNormalized = teacherKey.normalizedValue;
                lesson.teacherId = teacherKey.id;

                lesson.name = subgroup1Lesson?.value || '';
                lesson.audience = audience;
                lesson.audienceId = audienceKey.id;

                lessons.push(lesson);

                // Две подгруппы - создаём и пушим два отдельных урока
            } else {
                teacher = this.cellInfo(`${group.startCol}${row}`, 0, 1)?.value || '';
                teacherKey = await this.setIdToTeacher(teacher);
                audience = this.cellInfo(`${group.startCol}${row}`, 1, 0)?.value || '';
                audienceKey = await this.setId(audience, 'audience');

                const lesson1: Lesson = {
                    teacher: teacher,
                    teacherNormalized: teacherKey.normalizedValue,
                    teacherId: teacherKey.id,

                    number: lesson.number,
                    group: lesson.group,
                    groupId: groupKey.id,
                    name: subgroup1Lesson?.value || '',
                    audience: audience,
                    audienceId: audienceKey.id,
                    subgroup: 1,
                    day: lesson.day,
                    weekTitle: lesson.weekTitle,
                };
                if (subgroup1Lesson?.value) lessons.push(lesson1);


                teacher = this.cellInfo(`${group.startCol}${row}`, 2, 1)?.value || '';
                teacherKey = await this.setIdToTeacher(teacher);
                audience = this.cellInfo(`${group.startCol}${row}`, 3, 0)?.value || '';
                audienceKey = await this.setId(audience, 'audience');

                const lesson2: Lesson = {
                    teacher: teacher,
                    teacherNormalized: teacherKey.normalizedValue,
                    teacherId: teacherKey.id,

                    number: lesson.number,
                    group: lesson.group,
                    groupId: groupKey.id,
                    name: subgroup2Lesson?.value || '',
                    audience: audience,
                    audienceId: audienceKey.id,
                    subgroup: 2,
                    day: lesson.day,
                    weekTitle: lesson.weekTitle,
                };
                if (subgroup2Lesson?.value) lessons.push(lesson2);
            }
        }
        return lessons;
    },

    parseDate() {
        if (!this.weekTitle) return { start: '', end: '' };

        // Ищем все куски, похожие на дату (например: 23.01.2025, 2.6.25 и т.п.)
        const matches = this.weekTitle.match(/\d{1,2}\.\d{1,2}\.\d{2,4}/g);

        if (!matches || matches.length < 2) {
            throw new Error(`Не удалось выделить даты из weekTitle: ${this.weekTitle}`);
        }

        const start = normalizeDate(matches[0]);
        const end = normalizeDate(matches[1]);

        return { start, end };
    },

    async fullParse() {
        this.teacherKeys = await keysService.findAllByType('teacher');
        this.groupsKeys = await keysService.findAllByType('group');
        this.audienceKeys = await keysService.findAllByType('audience');

        this.findGroups();
        this.findDays();

        const weekLessons: WeekLessons = {
            lessons: [],
            weekTitle: this.weekTitle,
            weekTitleId: this.weekTitle.toLowerCase().replace(/[\s.-]/g, ''),
            startDate: this.parseDate().start,
            endDate: this.parseDate().end,
            isCurrent: false,
        };

        const pairs = this.groups.flatMap(group =>
            this.days.map(day => ({ group, day })),
        );
        for (const { group, day } of pairs) {
            const dayLessons = await this.parseDayLessonsFromGroup(day, group);
            weekLessons.lessons.push(...dayLessons);
        }

        const result = await scheduleService.create(weekLessons);
        console.log(result);
        cacheService.clear();
        return result;
    },
};

export default tableService;
