import * as fs from "fs";
import * as path from "path";

const LOGPATH = path.join(__dirname, "..", "..", "logs");
const LOGLEVELS = {
  request: "[REQ]",
  error: "[ERR]",
  fatalerror: "[FAT]",
  generic: "[LOG]",
};

export class loggerSession {
  logfilePath: string;
	shouldLog: boolean;

  constructor(shouldLog: boolean = true) {
    this.logfilePath = path.join(
      LOGPATH,
      `${getCurrentFormattedDateTime('file')}.log`
    );
		this.shouldLog = shouldLog;

		if (!shouldLog) {
			try {
				fs.writeFileSync(this.logfilePath, "", { encoding: "utf8" });
				console.log(
					`[LOGS] Created new log file for this session ➜  ${this.logfilePath}`
				);
			} catch (err) {
				console.error("[LOGS] Could not create new log file:", err);
			}			
		} else {
			console.log(`[LOGS] No logs will be recorded for this session`)
		}
  }

  log(
    level: "request" | "error" | "fatalerror" | "generic",
    text: string
  ) {
		if (!this.shouldLog) {return}
    const logLevel = LOGLEVELS[level] || LOGLEVELS.generic;

    const timestamp = getCurrentFormattedDateTime('time');
    const logEntry = `${logLevel} ${timestamp} "${text}"\n`;

    try {
      fs.writeFileSync(this.logfilePath, logEntry, {
        encoding: "utf8",
        flag: "a",
      });
    } catch (err) {
      console.error("[LOGS] Error writing file:", err);
    }
  }
}

function getCurrentFormattedDateTime(formatAs: 'file' | 'time') {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return formatAs == 'time' ? `${year}.${month}.${day} ${hours}:${minutes}:${seconds}` : `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
}