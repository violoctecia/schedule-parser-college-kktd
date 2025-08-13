import { scheduleService } from '@/src/database/schedule/schedule.service.ts';
import { ScheduleType } from '@/src/types/schedule.ts';

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


        this.cache.set(type, data);
        return data;
    }

    clear(type?: ScheduleType) {
        if (type) {
            this.cache.delete(type);
        } else {
            this.cache.clear();
        }
    }
}

export const cacheService = new CacheService();
