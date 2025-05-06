// listFiles.js
import fs from "fs";
import path from "path";

const EXCLUDE_DIRS = new Set(["node_modules", ".git", ".replit", ".cache"]);

function walkDir(dir, fileList = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.has(name)) {
        walkDir(full, fileList);
      }
    } else {
      fileList.push(full);
    }
  }
  return fileList;
}

function main() {
  const startDir = path.resolve("src");
  if (!fs.existsSync(startDir)) {
    console.error("📁 No src/ directory found. Adjust the path in listFiles.js");
    process.exit(1);
  }

  const files = walkDir(startDir);
  const rows = ["file_path,line_count"];
  for (const file of files) {
    if (!file.match(/\.(js|jsx|ts|tsx|css|html|json|md)$/)) continue;
    const content = fs.readFileSync(file, "utf8");
    const lineCount = content.split(/\r\n|\r|\n/).length;
    rows.push(`${path.relative(process.cwd(), file)},${lineCount}`);
  }
  fs.writeFileSync("file_list.csv", rows.join("\n"), "utf8");
  console.log("✅ file_list.csv generated with", rows.length - 1, "entries.");
}

main();
