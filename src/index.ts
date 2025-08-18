import { initDatabase } from '@/src/database/index.js';
import { startBot } from '@/src/bots/main/index.js';
import { startAdminBot } from '@/src/bots/admin/index.js';

initDatabase();
startBot();
startAdminBot();

