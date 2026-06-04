const fs = require('fs');
const lines = fs.readFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('function ContentPlanner('));
let bracketCount = 0;
let end = start;
for (let i = start; i < lines.length; i++) {
  if (lines[i].includes('{')) bracketCount += (lines[i].match(/\{/g) || []).length;
  if (lines[i].includes('}')) bracketCount -= (lines[i].match(/\}/g) || []).length;
  if (bracketCount === 0 && i > start) { end = i; break; }
}
console.log(`${start + 1} ${end + 1}`);
