import XLSX from 'xlsx';
import type { CellInfo, MergeMap, TableData } from '@/src/types/schedule.ts';

export class CellInfoService {
    constructor(
        private table: TableData,
        private mergedMap: MergeMap,
        private merges: XLSX.Range[]
    ) {}

    getCellInfo(address: string, colOffset = 0, rowOffset = 0): CellInfo | null {
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
    }
}
