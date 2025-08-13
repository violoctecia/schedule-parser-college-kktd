import tableService from '@/src/services/table-service.ts';
import { initDatabase } from '@/src/database/index.ts';
import { startBot } from '@/src/bot/index.ts';

initDatabase();
startBot();

tableService.load('uploads/example.xlsx');
