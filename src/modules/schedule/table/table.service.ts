import { TableLoader } from '@/src/modules/schedule/table//table.loader.ts';
import { CellInfoService } from '@/src/modules/schedule/table/table.cellInfo.ts';
import { TableFinders } from '@/src/modules/schedule/table/table.finders.ts';
import { TableParser } from '@/src/modules/schedule/table/table.parser.ts';
import type { CellInfo, WeekLessons } from '@/src/types/schedule.ts';
import { scheduleService } from '@/src/modules/schedule/schedule.service.ts';

const startPoints = {
    groups: 'F10',
    weekDays: 'A12',
    lessonNumbersCol: 'B',
    weekName: 'A6',
};

export class TableService {
    private loader = new TableLoader();
    private cellInfoService!: CellInfoService;
    private finders!: TableFinders;
    private parser!: TableParser;

    weekTitle: string = '';
    groups: CellInfo[] = [];
    days: CellInfo[] = [];
    groupsListCache: string[] | null = null;

    async load(filePath: string) {
        console.log('✅ Start loading table from', filePath);
        this.loader.load(filePath);

        this.cellInfoService = new CellInfoService(this.loader.table, this.loader.mergedMap, this.loader.merges);
        this.finders = new TableFinders(this.cellInfoService);
        this.parser = new TableParser(this.cellInfoService, '', startPoints.lessonNumbersCol);

        this.weekTitle =
            this.cellInfoService.getCellInfo(startPoints.weekName)?.value ||
            new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(new Date());

        this.parser.weekTitle = this.weekTitle;

        this.groups = this.finders.findGroups(startPoints.groups);
        this.days = this.finders.findDays(startPoints.weekDays);
        this.groupsListCache = null;

        await this.fullParse();
    }

    async fullParse() {
        const weekLessons: WeekLessons = { lessons: [], weekTitle: this.weekTitle };

        for (const group of this.groups) {
            for (const day of this.days) {
                weekLessons.lessons.push(...this.parser.parseDayLessonsFromGroup(day, group));
            }
        }

        const result = await scheduleService.create(weekLessons);
        console.log('✅ Schedule saved');
    }

    async getGroupsList() {
        if (this.groupsListCache) {
            console.log('✅ restore groupsListCache');
            return this.groupsListCache;
        }
        if (this.groups.length) {
            this.groupsListCache = this.groups.map(g => g.value);
        } else {
            this.groupsListCache = await scheduleService.findAllGroups();
        }
        return this.groupsListCache;
    }

    resetGroupsCache() {
        this.groupsListCache = null;
    }
}

export default new TableService();
