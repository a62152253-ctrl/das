const fs = require("fs");
const path = require("path");

const SOURCE = "./components";
const OUTPUT = "./components-flat";

const extensions = [".tsx", ".ts"];

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT);
}


function getFiles(dir) {
  let result = [];

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      result.push(...getFiles(full));
    } else if (extensions.includes(path.extname(full))) {
      result.push(full);
    }
  }

  return result;
}


const files = getFiles(SOURCE);

const map = {};


for (const file of files) {

  let name = path.basename(file);

  let target = path.join(OUTPUT, name);


  // konflikt nazw
  if (fs.existsSync(target)) {

    const folder = path.basename(
      path.dirname(file)
    );

    name =
      folder +
      "_" +
      name;

    target = path.join(
      OUTPUT,
      name
    );
  }


  fs.copyFileSync(file, target);

  map[
    file.replaceAll("\\", "/")
  ] = "./" + name;


  console.log(
    "COPY:",
    file,
    "=>",
    target
  );
}


const flatFiles = fs.readdirSync(OUTPUT);


for (const file of flatFiles) {

  const full = path.join(
    OUTPUT,
    file
  );

  if (!extensions.includes(path.extname(file)))
    continue;


  let content = fs.readFileSync(
    full,
    "utf8"
  );


  content = content.replace(
    /from\s+["'](.+?)["']/g,
    (match, imp) => {

      if (!imp.startsWith("."))
        return match;


      const name =
        path.basename(imp);


      const possible =
        flatFiles.find(x =>
          x.startsWith(name)
        );


      if (possible) {

        return `from "./${possible.replace(/\.(tsx|ts)$/,"")}"`;
      }


      return match;
    }
  );


  fs.writeFileSync(
    full,
    content
  );
}


console.log(
  "\nDONE - components flattened"
);