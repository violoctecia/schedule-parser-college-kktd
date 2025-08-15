import { scheduleService } from '@/src/database/schedule/schedule.service.js';
import { ScheduleType } from '@/src/types/schedule.js';

type List = string[] | {teacherNormalized: string, teacherId: string}[];

class CacheService {
    private cache = new Map<ScheduleType, List>();

    async getList(type: ScheduleType): Promise<List> {

        if (this.cache.has(type) && this.cache.get(type)!.length > 0) {
            console.log('✅ restore cache for', type);
            return this.cache.get(type)!;
        }

        let data: List = [];
        console.log('create cache for', type);
        if (type === 'teacher') {
            data = await scheduleService.findAllTeachers();
        } else {
            data = await scheduleService.findAllByType(type);
        }

        console.log('new cache:', data);
        this.cache.set(type, data);
        return data;
    }

    clear() {
        this.cache.clear();
    }
}

export const cacheService = new CacheService();
