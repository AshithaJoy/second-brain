import fs from "fs";

const content = fs.readFileSync("./src/App.jsx", "utf-8");
const lines = content.split("\n");

lines.forEach((line, index) => {
  if (line.trim().startsWith("const S = {")) {
    console.log(`Found S definition at line ${index + 1}:`);
    for (let i = index; i < index + 100; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});
