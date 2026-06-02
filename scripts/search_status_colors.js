import fs from "fs";

const content = fs.readFileSync("./src/App.jsx", "utf-8");
const lines = content.split("\n");

console.log("=== Matching STATUS_COLORS ===");
lines.forEach((line, index) => {
  if (line.includes("STATUS_COLORS")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
