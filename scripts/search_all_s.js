import fs from "fs";

const content = fs.readFileSync("./src/App.jsx", "utf-8");
const lines = content.split("\n");

console.log("=== Matching S Definitions ===");
lines.forEach((line, index) => {
  if (line.includes("const S = {")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
