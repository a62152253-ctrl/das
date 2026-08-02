const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const extensions = [".ts", ".tsx", ".js", ".jsx"];

const fixes = {
  "../types": "@/types",
  "../../types": "@/types",

  "../lib/firebase": "@/lib/firebase",
  "../../lib/firebase": "@/lib/firebase",

  "../lib/utils": "@/lib/utils",
  "../../lib/utils": "@/lib/utils",

  "../lib/useToast": "@/lib/useToast",
  "../../lib/useToast": "@/lib/useToast",

  "../ui": "@/ui",
  "../../ui": "@/ui",

  "../ui/Toast": "@/ui/Toast",
  "../ui/Button": "@/ui/Button",
  "../ui/Badge": "@/ui/Badge",
  "../ui/Skeleton": "@/ui/Skeleton",

  "./Sidebar": "@/components/Sidebar",
  "./DarkModeToggle": "@/components/DarkModeToggle",

  "./common/Navbar": "@/components/common/Navbar",

  "./booking/CompanyBookingsManager":
    "@/components/booking/CompanyBookingsManager",

  "./search/botFilters": "@/components/search/botFilters",
  "./search/BotSteps": "@/components/search/BotSteps",
  "./search/MessageBubble": "@/components/search/MessageBubble",
  "./search/ResultsView": "@/components/search/ResultsView",
  "./search/botConstants": "@/components/search/botConstants",
};


function getFiles(dir) {
  let result = [];

  for (const file of fs.readdirSync(dir)) {

    const full = path.join(dir, file);

    if (
      full.includes("node_modules") ||
      full.includes(".next") ||
      full.includes("dist")
    ) continue;

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      result = result.concat(getFiles(full));
    } 
    else if (extensions.includes(path.extname(file))) {
      result.push(full);
    }
  }

  return result;
}


const files = getFiles(ROOT);

let changed = 0;


for (const file of files) {

  let content = fs.readFileSync(file, "utf8");

  let original = content;


  for (const [oldPath, newPath] of Object.entries(fixes)) {

    const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      `(["'])${escaped}(["'])`,
      "g"
    );

    content = content.replace(
      regex,
      `$1${newPath}$2`
    );
  }


  if (content !== original) {

    fs.copyFileSync(
      file,
      file + ".bak"
    );

    fs.writeFileSync(
      file,
      content
    );

    changed++;

    console.log("FIX:", file);
  }
}


console.log("\n================");
console.log("Naprawione pliki:", changed);
console.log("================");