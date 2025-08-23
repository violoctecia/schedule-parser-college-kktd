import { formatText } from '@/src/utils/format-text.js';

export function normalizeTeacher(originalTeacherName: string, withSpaces = false): string {
    if (!originalTeacherName) return '';

    let name = originalTeacherName.toLowerCase().trim();

    // шаблон: фамилия + 1–2 буквы (с точками или без) + любые пробелы между ними
    // [\p{L}]+ — фамилия
    // (?:\s?[\p{L}]\.?\s?){1,2} — 1 или 2 инициала, с точками или без
    const initialsPattern = /^([\p{L}]+(?:\s?[\p{L}]\.?\s?){1,2})/u;

    const match = name.match(initialsPattern);
    if (match) {
        name = match[1];
    }

    if (withSpaces) {
        return formatText(name);
    }

    return name.replace(/[\s.]/g, '');
}
