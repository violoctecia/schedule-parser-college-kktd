# College Schedule Parser & Viewer

### Start
1. Run `pnpm install`
2. Run `pnpm dev`

or

1. docker build -t schedule-bot .
2. docker run --env-file .env schedule-bot

### Configuration
- Copy and setup `.env` file from `.env.example`
- Configure lesson times in 'times' object in `src/utils/lesson-time.ts`
- Configure parser 'startPoints' object in `src/services/table.service.ts`
- Configure images in 'cfg' object in `src/utils/generate-image.ts`

