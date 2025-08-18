import { parse } from "date-fns";

const formats = [
    "dd.MM.yyyy",
    "d.MM.yyyy",
    "d.M.yyyy",
    "dd.M.yyyy",
    "dd.MM.yy",
    "d.MM.yy",
    "d.M.yy",
    "dd.M.yy",
];

export function normalizeDate(input: string): Date {
    for (const fmt of formats) {
        try {
            const date = parse(input, fmt, new Date());
            if (!isNaN(date.getTime())) {
                return date;
            }
        } catch (_) {}
    }
    throw new Error(`Не удалось распарсить дату: ${input}`);
}
