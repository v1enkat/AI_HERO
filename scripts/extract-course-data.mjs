import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(root, 'legacy/app.ai-engine.js'), 'utf8');
const start = s.indexOf('courseData:');
if (start < 0) throw new Error('no courseData');
let i = s.indexOf('{', start);
let depth = 0;
let j = i;
for (; j < s.length; j++) {
  const c = s[j];
  if (c === '{') depth++;
  else if (c === '}') {
    depth--;
    if (depth === 0) {
      j++;
      break;
    }
  }
}
const objStr = s.slice(i, j);
const courseData = Function(`"use strict"; return (${objStr})`)();
const outDir = path.join(root, 'src/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'courseData.json'), JSON.stringify(courseData));
console.log('OK', Object.keys(courseData));
