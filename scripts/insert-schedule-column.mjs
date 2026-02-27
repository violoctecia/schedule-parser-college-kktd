/**
 * Вставляет пустые колонки в xls/xlsx там, где между двумя группами нет разделителя.
 * Использование: node scripts/insert-schedule-column.mjs "путь/к/файлу.xls"
 * Результат: файл с суффиксом _fixed.xlsx в той же папке.
 */

import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const filePath = process.argv[2];
if (!filePath) {
    console.error('Укажите путь к файлу: node scripts/insert-schedule-column.mjs "путь/к/файлу.xls"');
    process.exit(1);
}

let workbook;
try {
    const buf = readFileSync(filePath);
    workbook = XLSX.read(buf, { type: 'buffer', cellNF: false });
} catch (e) {
    console.error('Не удалось прочитать файл:', e.message);
    process.exit(1);
}

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
let merges = sheet['!merges'] || [];
let range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

function buildMergedMap(merges) {
    const map = new Map();
    merges.forEach(({ s, e }) => {
        const startAddr = XLSX.utils.encode_cell(s);
        for (let r = s.r; r <= e.r; r++) {
            for (let c = s.c; c <= e.c; c++) {
                map.set(XLSX.utils.encode_cell({ r, c }), startAddr);
            }
        }
    });
    return map;
}

function getCellValue(sheet, addr, mergedMap) {
    const master = mergedMap.get(addr) || addr;
    const cell = sheet[master];
    if (!cell || cell.v === undefined || cell.v === null || String(cell.v).trim() === '') return null;
    return String(cell.v).trim();
}

function findCellByText(sheet, search, range) {
    const target = search.trim().toLowerCase();
    for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const cell = sheet[addr];
            const raw = cell && cell.v != null ? String(cell.v).trim() : '';
            if (raw && raw.toLowerCase() === target) return { r, c };
        }
    }
    return null;
}

let mergedMap = buildMergedMap(merges);
const prepCell = findCellByText(sheet, 'преподаватель', range);
if (!prepCell) {
    console.error('Не найдена ячейка "преподаватель" в файле.');
    process.exit(1);
}

const groupsRow = prepCell.r + 1;
const startCol = prepCell.c;

const insertCols = [];
let prevEndCol = -1;

for (let c = startCol; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: groupsRow, c });
    const masterAddr = mergedMap.get(addr) || addr;
    const val = getCellValue(sheet, addr, mergedMap);
    if (!val) continue;
    const { c: mc } = XLSX.utils.decode_cell(masterAddr);
    const merge = merges.find((m) => m.s.r === groupsRow && m.s.c === mc);
    const endCol = merge ? merge.e.c : mc;
    if (prevEndCol >= 0) {
        const gap = c - prevEndCol - 1;
        if (gap === 0) {
            insertCols.push(c);
        }
    }
    prevEndCol = endCol;
    c = endCol;
}

// Запасной вариант: если объединений нет (.xls), ищем колонки с группами и шаг 4 вместо 5
if (insertCols.length === 0) {
    const groupCols = [];
    for (let c = startCol; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: groupsRow, c });
        const val = getCellValue(sheet, addr, mergedMap);
        if (val) groupCols.push(c);
    }
    for (let i = 1; i < groupCols.length; i++) {
        const step = groupCols[i] - groupCols[i - 1];
        if (step === 4) {
            insertCols.push(groupCols[i]);
            console.log('Найдено (по шагу): две группы через 4 колонки, вставка перед', groupCols[i] + 1);
        }
    }
}

if (insertCols.length === 0) {
    console.log('Все группы уже разделены пустыми колонками. Вставка не требуется.');
    process.exit(0);
}

insertCols.sort((a, b) => b - a);
console.log('Вставка пустых колонок перед колонками (индекс):', insertCols);

function insertColumn(sheet, atCol) {
    const newSheet = {};
    const newMerges = [];

    for (const [addr, cell] of Object.entries(sheet)) {
        if (addr.startsWith('!')) {
            if (addr === '!ref') {
                const r = XLSX.utils.decode_range(sheet['!ref']);
                r.e.c += 1;
                newSheet['!ref'] = XLSX.utils.encode_range(r);
            } else if (addr === '!merges') {
                continue;
            } else {
                newSheet[addr] = cell;
            }
            continue;
        }
        const { r, c } = XLSX.utils.decode_cell(addr);
        if (c >= atCol) {
            const newAddr = XLSX.utils.encode_cell({ r, c: c + 1 });
            newSheet[newAddr] = cell;
        } else {
            newSheet[addr] = cell;
        }
    }

    (sheet['!merges'] || []).forEach((m) => {
        const newMerge = { s: { ...m.s }, e: { ...m.e } };
        if (m.s.c >= atCol) {
            newMerge.s.c = m.s.c + 1;
            newMerge.e.c = m.e.c + 1;
        } else if (m.e.c >= atCol) {
            newMerge.e.c = m.e.c + 1;
        }
        newMerges.push(newMerge);
    });

    newSheet['!merges'] = newMerges;
    return newSheet;
}

let currentSheet = sheet;
for (const atCol of insertCols) {
    currentSheet = insertColumn(currentSheet, atCol);
}

workbook.Sheets[sheetName] = currentSheet;

const baseName = filePath.split(/[/\\]/).pop().replace(/\.(xls|xlsx)$/i, '');
const outPath = join(process.cwd(), `${baseName}_fixed.xlsx`);

try {
    writeFileSync(outPath, XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    console.log('Готово. Сохранено:', outPath);
} catch (e) {
    console.error('Ошибка записи:', e.message);
    process.exit(1);
}
