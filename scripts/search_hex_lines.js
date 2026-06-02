import fs from "fs";

const content = fs.readFileSync("./src/App.jsx", "utf-8");
const lines = content.split("\n");

const colors = ['#c9b99a', '#d4c5e2', '#f0a090', '#a0b8c8', '#a8c8a0', '#b8b8c8', '#c8b890', '#f0c870', '#b0a0c0', '#b8c8b8', '#d4b8a0', '#c0b0d8', '#b0a898', '#8878a0', '#6ea87a', '#6a8ca8'];

console.log("=== Lines with hex codes in App.jsx ===");
lines.forEach((line, index) => {
  colors.forEach(color => {
    if (line.includes(color)) {
      console.log(`${index + 1}: ${line.trim()}`);
    }
  });
});
