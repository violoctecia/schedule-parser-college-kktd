# College Schedule Parser & Viewer

This project parses college schedules and makes them easily accessible for students, teachers, and parents.

### Problem
Every week, students and teachers receive a large XLSX file with the schedule for the current week. Viewing it on mobile devices is inconvenient.

### Solution
The project automatically:
- Parses schedules for each group.
- Supports teacher schedule search, handling multiple name variations in the XLSX file.

#### Key Features
- Teacher names are normalized through multiple steps: extra spaces, characters, or words after initials are removed.
- A Levenshtein algorithm is used to assign a unique key to each teacher, ensuring all lessons are found even if names are slightly different.
- The Telegram bot provides manual search for groups or teachers, with suggestions for incorrect inputs using Levenshtein matching.

---

### Parser
- File: `src/services/table.service.ts`
- `startPoints` contains the starting addresses in the XLSX table.
- If the table format changes, you only need to update these starting points.

### Schedule Image Generation
- File: `src/utils/generate-image.ts`
- `cfg` contains settings for image generation (colors, rounded corners, scale).
- The layout is optimized so that even large schedules remain readable on mobile devices.  
