import { parse, format } from "date-fns"

const formats = [
    "dd.MM.yyyy",
    "d.MM.yyyy",
    "d.M.yyyy",
    "dd.M.yyyy",
    "dd.MM.yy",
    "d.MM.yy",
    "d.M.yy",
    "dd.M.yy",
]

export function normalizeDate(input: string): string {
    let parsedDate: Date | null = null

    for (const fmt of formats) {
        try {
            const date = parse(input, fmt, new Date())
            if (!isNaN(date.getTime())) {
                parsedDate = date
                break
            }
        } catch (e) {

        }
    }

    if (!parsedDate) {
        throw new Error(`Не удалось распарсить дату: ${input}`)
    }

    return format(parsedDate, "dd.MM.yyyy")
}
