const fs = require('fs');
const content = fs.readFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', 'utf8');

// Find all tabs
const tabMatches = content.match(/tab === ["']([a-zA-Z]+)["']/g) || [];
console.log("Tabs:", Array.from(new Set(tabMatches)));

// Find all CRUD functions
const crudMatches = content.match(/api[A-Z][a-zA-Z]+/g) || [];
console.log("API Calls:", Array.from(new Set(crudMatches)));

// Find all handle actions
const handleMatches = content.match(/handle[A-Z][a-zA-Z]+/g) || [];
console.log("Handlers:", Array.from(new Set(handleMatches)));
