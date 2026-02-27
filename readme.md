# 📅 College Schedule Parser & Viewer

Telegram-бот для просмотра расписания колледжа ККТД.

---

## 🚀 Быстрый старт

**Локально:**
```bash
pnpm install
pnpm dev
```

**Docker:**
```bash
docker build -t schedule-bot .
docker run -d --name schedule-bot --restart unless-stopped --env-file .env schedule-bot
```
Проверка логов: `docker logs -f schedule-bot`




## Configuration

- Copy and setup `.env` file from `.env.example`
- Configure lesson times in 'times' object in `src/utils/lesson-time.ts`
- Configure parser 'startPoints' object in `src/services/table.service.ts`
- Configure images in 'cfg' object in `src/utils/generate-image.ts`
