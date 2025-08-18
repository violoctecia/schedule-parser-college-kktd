import { DayLessons, Schedule, ScheduleType } from '@/src/types/schedule.js';
import { Key } from '@/src/types/keys.js';
import { keysService } from '@/src/database/keys/keys.service.js';
import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { generateImage } from '@/src/utils/generate-image.js';
import { cfg } from '@/src/config.js';

type List = Key[];
type ImageKey = `${ScheduleType}_${string}_${'current' | 'next'}_part_${number}`;

class CacheService {
    private cacheLists = new Map<ScheduleType, List>();
    private cacheImages = new Map<ImageKey, Buffer>();
    private cacheOrder: ImageKey[] = []; // порядок LRU (Least Recently Used)
    private cacheSize = 0;
    private maxCacheSize = cfg.imageMaxCacheSize

    private addToCache(key: ImageKey, buffer: Buffer) {
        const size = buffer.byteLength;

        while (this.cacheSize + size > this.maxCacheSize && this.cacheOrder.length) {
            const oldKey = this.cacheOrder.shift()!;
            const oldBuffer = this.cacheImages.get(oldKey)!;
            this.cacheImages.delete(oldKey);
            this.cacheSize -= oldBuffer.byteLength;
        }

        this.cacheImages.set(key, buffer);
        this.cacheOrder.push(key);
        this.cacheSize += size;
    }

    private splitSchedule(schedule: Schedule, maxLessonsPerPart: number = 22): Schedule[] {
        const days = Object.entries(schedule);
        const parts: Schedule[] = [];

        let currentPart: [string, DayLessons][] = [];
        let lessonsInPart = 0;

        for (const [dayName, dayLessons] of days) {
            const dayCount = Object.values(dayLessons).reduce((acc, lessons) => acc + lessons.length, 0);

            if (lessonsInPart + dayCount > maxLessonsPerPart && currentPart.length) {
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

    async getList(type: ScheduleType): Promise<List> {
        if (this.cacheLists.has(type) && this.cacheLists.get(type)!.length > 0) {
            return this.cacheLists.get(type)!;
        }

        let data: List = await keysService.findAllByType(type);
        this.cacheLists.set(type, data);
        return data;
    }

    async getImage(type: ScheduleType, value: string, position: 'current' | 'next'): Promise<Buffer[] | null> {
        const buffers: Buffer[] = [];
        let idx = 1;

        while (true) {
            const key: ImageKey = `${type}_${value}_${position}_part_${idx}`;
            const buf = this.cacheImages.get(key);
            if (!buf) break;

            // LRU обновление
            const pos = this.cacheOrder.indexOf(key);
            if (pos >= 0) {
                this.cacheOrder.splice(pos, 1);
                this.cacheOrder.push(key);
            }

            buffers.push(buf);
            idx++;
        }

        if (buffers.length > 0) return buffers;

        const typeMap = { group: 'groupId', teacher: 'teacherId', audience: 'audienceId' } as const;
        const schedule = await scheduleService.getScheduleBy(position, typeMap[type], value);
        if (!schedule || typeof schedule === 'string') return null;

        const scheduleParts = this.splitSchedule(schedule as Schedule, 18);

        for (let i = 0; i < scheduleParts.length; i++) {
            const part = scheduleParts[i];
            const buffer = await generateImage(part, type);
            if (!buffer) continue;

            const key: ImageKey = `${type}_${value}_${position}_part_${i + 1}`;
            this.addToCache(key, buffer);
            buffers.push(buffer);
        }

        return buffers.length > 0 ? buffers : null;
    }


    clear() {
        this.cacheLists.clear();
        this.cacheImages.clear()
        this.cacheOrder = [];
        this.cacheSize = 0;
        console.log('✅ Cache cleared');
    }
}

export const cacheService = new CacheService();


