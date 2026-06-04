const fs = require('fs');
const file = 'C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('function BRollVault('));

if (start !== -1) {
  let bracketCount = 0;
  let started = false;
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('{')) bracketCount += (lines[i].match(/\{/g) || []).length;
    if (lines[i].includes('}')) bracketCount -= (lines[i].match(/\}/g) || []).length;
    started = true;
    if (bracketCount === 0) {
      end = i;
      break;
    }
  }

  if (end !== -1) {
    lines.splice(start, end - start + 1);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("BRollVault function removed.");
  }
}
