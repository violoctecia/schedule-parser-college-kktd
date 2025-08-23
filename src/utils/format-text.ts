export function formatText(str: string) {
    return str
        .trim()
        .split(/\s+/)
        .map((word) =>
            word
                .split('.')
                .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ''))
                .join('.'),
        )
        .join(' ');
}
