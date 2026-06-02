import fs from "fs";

const content = fs.readFileSync("./src/App.jsx", "utf-8");
const lines = content.split("\n");

let styleLinesCount = 0;
lines.forEach((line, index) => {
  if (line.includes("style={") && styleLinesCount < 30) {
    console.log(`${index + 1}: ${line.trim()}`);
    styleLinesCount++;
  }
});
