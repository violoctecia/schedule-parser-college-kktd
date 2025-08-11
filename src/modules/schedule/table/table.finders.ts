import type { CellInfo } from '@/src/types/schedule.ts';
import { CellInfoService } from '@/src/modules/schedule/table/table.cellInfo.ts';

export class TableFinders {
    constructor(private cellInfoService: CellInfoService) {}

    findGroups(startPoint: string, colStep = 5): CellInfo[] {
        const groups: CellInfo[] = [];
        let colOffset = 0;

        while (true) {
            const group = this.cellInfoService.getCellInfo(startPoint, colOffset, 0);
            if (!group?.value) break;
            groups.push(group);
            colOffset += colStep;
        }
        return groups;
    }

    findDays(startPoint: string): CellInfo[] {
        const days: CellInfo[] = [];
        let currentPoint = startPoint;

        while (true) {
            const day = this.cellInfoService.getCellInfo(currentPoint, 0, 1);
            if (!day?.value) break;
            days.push(day);
            currentPoint = day.endAddress;
        }
        return days;
    }
}
