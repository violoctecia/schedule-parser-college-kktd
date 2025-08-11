import XLSX from 'xlsx';
import type { TableData, MergeMap } from '@/src/types/schedule.ts';

export class TableLoader {
    table: TableData = {};
    mergedMap: MergeMap = new Map();
    merges: XLSX.Range[] = [];

    load(filePath: string) {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        this.merges = sheet['!merges'] || [];

        this.mergedMap.clear();
        for (const { s, e } of this.merges) {
            const startCell = XLSX.utils.encode_cell(s);
            for (let r = s.r; r <= e.r; r++) {
                for (let c = s.c; c <= e.c; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    this.mergedMap.set(addr, startCell);
                }
            }
        }

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
    }
}
