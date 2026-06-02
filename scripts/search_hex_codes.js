import fs from "fs";
import path from "path";

const content = fs.readFileSync("./src/App.jsx", "utf-8");

const hexRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g;
const matches = content.match(hexRegex);

const uniqueMatches = Array.from(new Set(matches));
console.log("=== Unique Hex Codes in App.jsx ===");
console.log(uniqueMatches);
