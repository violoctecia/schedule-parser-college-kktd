import { DayLessons, Schedule, SchedulePosition, ScheduleType } from '@/src/types/schedule.js';
import { Key } from '@/src/types/keys.js';
import { keysService } from '@/src/database/keys/keys.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { generateImage } from '@/src/utils/generate-image.js';
import { cfg } from '@/src/config.js';

type List = Key[];
type ImageKey = `${ScheduleType}_${string}_${SchedulePosition}_part_${number}`;
type ImageCacheEntry = {
    buffer: Buffer;
    weekTitle: string;
};

class CacheService {
    private cacheLists = new Map<ScheduleType, List>();
    private cacheImages = new Map<ImageKey, ImageCacheEntry>();
    private cacheOrder: ImageKey[] = []; // порядок LRU (Least Recently Used)
    private cacheSize = 0;
    private maxCacheSize = cfg.imageMaxCacheSize;

    async getList(type: ScheduleType): Promise<List> {
        if (this.cacheLists.has(type)) {
            return this.cacheLists.get(type)!;
        }
        const data: List = await keysService.findAllByType(type);
        this.cacheLists.set(type, data);
        return data;
    }

    async getImage(type: ScheduleType, value: string, position: SchedulePosition): Promise<{ buffers: Buffer[]; weekTitle: string } | null> {
        const buffers: Buffer[] = [];
        let weekTitle: string | null = null;
        let idx = 1;

        while (true) {
            const key: ImageKey = `${type}_${value}_${position}_part_${idx}`;
            const entry = this.cacheImages.get(key);
            if (!entry) break;

            // LRU update
            const pos = this.cacheOrder.indexOf(key);
            if (pos >= 0) {
                this.cacheOrder.splice(pos, 1);
                this.cacheOrder.push(key);
            }

            buffers.push(entry.buffer);
            if (!weekTitle) weekTitle = entry.weekTitle;
            idx++;
        }

        if (buffers.length > 0) return { buffers, weekTitle: weekTitle! };

        const typeMap = { group: 'groupId', teacher: 'teacherId', audience: 'audienceId' } as const;
        const schedule = await scheduleService.getScheduleBy(position, typeMap[type], value);
        if (!schedule || typeof schedule === 'string') return null;

        const scheduleParts = this.splitSchedule(schedule as Schedule, 30);

        for (let i = 0; i < scheduleParts.length; i++) {
            const part = scheduleParts[i];
            const buffer = await generateImage(part, type);
            if (!buffer) continue;

            const key: ImageKey = `${type}_${value}_${position}_part_${i + 1}`;

            const firstDayKey = Object.keys(part)[0];
            const firstDay = part[firstDayKey];
            const firstPairKey = Number(Object.keys(firstDay)[0]);
            const partWeekTitle = firstDay[firstPairKey][0]?.weekTitle ?? 'Без названия';

            this.addToCache(key, buffer, partWeekTitle);
            buffers.push(buffer);
            if (!weekTitle) weekTitle = partWeekTitle;
        }

        return buffers.length > 0 ? { buffers, weekTitle: weekTitle! } : null;
    }

    clear() {
        this.cacheLists.clear();
        this.cacheImages.clear();
        this.cacheOrder = [];
        this.cacheSize = 0;
        console.log('✅ Cache cleared');
    }

    private addToCache(key: ImageKey, buffer: Buffer, weekTitle: string) {
        const size = buffer.byteLength;

        while (this.cacheSize + size > this.maxCacheSize && this.cacheOrder.length) {
            const oldKey = this.cacheOrder.shift()!;
            const oldEntry = this.cacheImages.get(oldKey)!;
            this.cacheImages.delete(oldKey);
            this.cacheSize -= oldEntry.buffer.byteLength;
        }

        this.cacheImages.set(key, { buffer, weekTitle });
        this.cacheOrder.push(key);
        this.cacheSize += size;
    }

    private splitSchedule(schedule: Schedule, maxLessonsPerPart: number = 18): Schedule[] {
        const days = Object.entries(schedule);
        const totalLessons = days.reduce((acc, [, dayLessons]) => acc + Object.values(dayLessons).reduce((a, l) => a + l.length, 0), 0);

        const partsCount = Math.ceil(totalLessons / maxLessonsPerPart);
        const targetPerPart = Math.ceil(totalLessons / partsCount);

        const parts: Schedule[] = [];
        let currentPart: [string, DayLessons][] = [];
        let lessonsInPart = 0;

        for (let i = 0; i < days.length; i++) {
            const [dayName, dayLessons] = days[i];
            const dayCount = Object.values(dayLessons).reduce((acc, lessons) => acc + lessons.length, 0);

            if (lessonsInPart + dayCount > targetPerPart && currentPart.length > 0 && parts.length < partsCount - 1) {
                parts.push(Object.fromEntries(currentPart) as Schedule);
                currentPart = [];
                lessonsInPart = 0;
            }

            currentPart.push([dayName, dayLessons]);
            lessonsInPart += dayCount;
        }

        if (currentPart.length) {
            parts.push(Object.fromEntries(currentPart) as Schedule);
        }

        return parts;
    }
}

export const cacheService = new CacheService();
