import { distance } from 'fastest-levenshtein';

export function findClosest(list: string[], value: string, threshold = 2, maxResults = 6): string[] | null {
    const lowerValue = value.toLowerCase();

    const scored = list.map((item) => ({
        item,
        dist: distance(item.toLowerCase(), lowerValue),
    }));

    const closeMatches = scored
        .filter((x) => x.dist <= threshold)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxResults)
        .map((x) => x.item);

    if (closeMatches.length === 0) {
        return null;
    } else {
        return closeMatches;
    }
}
