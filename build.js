import fs from "fs";
import path from "path";

const dist = "./dist";
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy website files to dist
fs.copyFileSync("index.html", path.join(dist, "index.html"));
fs.copyFileSync("style.css", path.join(dist, "style.css"));
copyRecursive("assets", path.join(dist, "assets"));
copyRecursive("game", path.join(dist, "game"));
copyRecursive("libs", path.join(dist, "libs"));

console.log("Built dist successfully!");
