import { initDatabase } from '@/src/database/index.js';
import { startBot } from '@/src/bot/index.js';
import tableService from '@/src/services/table.service.js';

initDatabase()
startBot();


tableService.load('uploads/example.xlsx');









//
// // @ts-ignore
// import express from 'express';
// import { generateImage } from '@/src/utils/generate-image.js';
// import { scheduleService } from '@/src/database/schedule/schedule.service.js';
// const app = express();
//
// const testData2 = '{\n' +
//     '  "ПОНЕДЕЛЬНИК 23.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "ПОНЕДЕЛЬНИК 23.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d0"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "ВТОРНИК 24.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "ВТОРНИК 24.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d1"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "СРЕДА 25.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "СРЕДА 25.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d2"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "ЧЕТВЕРГ 26.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "ЧЕТВЕРГ 26.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d3"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "ПЯТНИЦА 27.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "ПЯТНИЦА 27.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d4"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "СУББОТА 28.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "СУББОТА 28.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d5"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  },\n' +
//     '  "ПОНЕДЕЛЬНИК 30.06.2025": {\n' +
//     '    "1": [\n' +
//     '      {\n' +
//     '        "name": "ГОСУДАРСТВЕННАЯ ИТОГОВАЯ АТТЕСТАЦИЯ",\n' +
//     '        "teacher": "",\n' +
//     '        "teacherNormalized": "",\n' +
//     '        "teacherId": "",\n' +
//     '        "audience": "",\n' +
//     '        "group": "29.02.01-4",\n' +
//     '        "number": 1,\n' +
//     '        "day": "ПОНЕДЕЛЬНИК 30.06.2025",\n' +
//     '        "weekTitle": "с 23.01.2025 г. по 30.06.2025 г.",\n' +
//     '        "isFullDay": true,\n' +
//     '        "_id": "689c3a91ace81045045224d6"\n' +
//     '      }\n' +
//     '    ]\n' +
//     '  }\n' +
//     '}\n'
// const testData = '{"ПОНЕДЕЛЬНИК 23.06.2025":{"1":[{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":1,"day":"ПОНЕДЕЛЬНИК 23.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522441"}]},"ВТОРНИК 24.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241a"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":1,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452242f"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":1,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522444"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241b"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":2,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522430"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":2,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522445"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241c"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":3,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522431"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":3,"day":"ВТОРНИК 24.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522446"}]},"СРЕДА 25.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241d"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":1,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522432"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":1,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522447"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241e"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":2,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522433"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":2,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522448"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452241f"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":3,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522434"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":3,"day":"СРЕДА 25.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522449"}]},"ЧЕТВЕРГ 26.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522420"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":1,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522435"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":1,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452244a"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522421"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":2,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522436"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":2,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452244b"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522422"},{"name":"ПП.03","teacher":"Деркунов М.Ю Производственная практика","teacherNormalized":"Деркунов М.Ю","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3К","number":3,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522437"},{"name":"ПП.11","teacher":"Деркунов М.Ю. Производственная практика","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3ПА","number":3,"day":"ЧЕТВЕРГ 26.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452244c"}]},"ПЯТНИЦА 27.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522423"},{"name":"ПМ.03 (Консультация)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":1,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522438"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522424"},{"name":"ПМ.03 (Консультация)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":2,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522439"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522425"},{"name":"ПМ.03 (Консультация)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":3,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243a"}],"4":[{"name":"ПМ.03 (Консультация)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":4,"day":"ПЯТНИЦА 27.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243b"}]},"СУББОТА 28.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522426"},{"name":"ПМ.03 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":1,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243c"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522427"},{"name":"ПМ.03 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":2,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243d"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522428"},{"name":"ПМ.03 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":3,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243e"}],"4":[{"name":"ПМ.03 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3К","number":4,"day":"СУББОТА 28.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452243f"}]},"ПОНЕДЕЛЬНИК 30.06.2025":{"1":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":1,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522429"},{"name":"ПМ.11 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3ПА","number":1,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452244f"}],"2":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":2,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452242a"},{"name":"ПМ.11 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3ПА","number":2,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522450"}],"3":[{"name":"ПП.08","teacher":"Деркунов М.Ю. Производственная практика.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"\' ","group":"09.02.07-3В","number":3,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace810450452242b"},{"name":"ПМ.11 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3ПА","number":3,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522451"}],"4":[{"name":"ПМ.11 (Экзамен)","teacher":"Деркунов М.Ю.","teacherNormalized":"Деркунов М.Ю.","teacherId":"деркуновмю","audience":"307","group":"09.02.07-3ПА","number":4,"day":"ПОНЕДЕЛЬНИК 30.06.2025","weekTitle":"с 23.01.2025 г. по 30.06.2025 г.","isFullDay":false,"_id":"689c3a91ace8104504522452"}]}}\n'
// const data = JSON.parse(testData2)
//
// // console.log(JSON.stringify(await scheduleService.getScheduleBy('с 23.01.2025 г. по 30.06.2025 г.', 'teacherId', 'деркуновмю')));
// // @ts-ignore
// app.get('/', async (req, res) => {
//     const buffer = await generateImage(data, 'teacher');
//     console.log('Размер картинки:', (buffer.length / 1024).toFixed(2), 'KB');
//
//     res.setHeader('Content-Type', 'image/png');
//     res.send(buffer);
// });
//
// app.listen(3000, () => {
//     console.log('Сервер запущен: http://localhost:3000/');
// });