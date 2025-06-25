import * as fs from "fs";
import * as path from "path";

const LOGPATH = path.join(__dirname, "..", "..", "logs");
const STORAGEPATH = path.join(__dirname, "..", "..", "storage");

if (fs.existsSync(LOGPATH)) {
  const files = fs.readdirSync(LOGPATH);

  files.forEach((file) => {
    const filePath = path.join(LOGPATH, file);

    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });

  console.log("Log history cleared");
}

if (fs.existsSync(STORAGEPATH)) {
  const files = fs.readdirSync(STORAGEPATH);

  files.forEach((file) => {
    const filePath = path.join(STORAGEPATH, file);

    if (fs.statSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  });
}
