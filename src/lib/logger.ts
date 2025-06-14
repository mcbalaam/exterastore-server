import * as fs from 'fs';
import * as path from 'path';

const LOGPATH = path.join(__dirname, '..', '..', 'logs');
const SESSION_FILE_RECORD = path.join(LOGPATH, 'current-session.log'); // Stores active log filename
const LOGLEVELS = {
	"request": "[REQ]",
	"error": "[ERR]",
	"fatalerror": "[FAT]",
	"generic": "[LOG]"
};

let SESSION_LOGFILE: string | null = null;

export function start() {
	if (!fs.existsSync(LOGPATH)) {
		fs.mkdirSync(LOGPATH, { recursive: true });
		console.log(`\x1b[32m[LOGS]\x1b[0m Initialized logging folder ➜  ${LOGPATH}`);
	}

	if (fs.existsSync(SESSION_FILE_RECORD)) {
		// Read existing session log filename to continue writing there
		try {
			const savedLogFile = fs.readFileSync(SESSION_FILE_RECORD, 'utf8').trim();
			// Check if file actually exists, else treat as no session
			if (fs.existsSync(savedLogFile)) {
				SESSION_LOGFILE = savedLogFile;
				console.log(`[LOGS] Continuing logging session to existing file ➜  ${SESSION_LOGFILE}`);
			} else {
				// Session file points to non-existent file, create new session file
				createNewSessionLogFile();
			}
		} catch (err) {
			console.error('[ERROR] Could not read session record file:', err);
			createNewSessionLogFile();
		}
	} else {
		// No session record file, create new session log file
		createNewSessionLogFile();
	}
}

function createNewSessionLogFile() {
	SESSION_LOGFILE = path.join(LOGPATH, `${getCurrentFormattedFilename()}.log`);
	try {
		fs.writeFileSync(SESSION_LOGFILE, '', { encoding: 'utf8' });
		// Write this filename to the session record file
		fs.writeFileSync(SESSION_FILE_RECORD, SESSION_LOGFILE, { encoding: 'utf8' });
		console.log(`[LOGS] Created new log file ➜  ${SESSION_LOGFILE}`);
	} catch (err) {
		console.error('[LOGS] Could not create new log file:', err);
		SESSION_LOGFILE = null;
	}
}

function getCurrentFormattedDateTime() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function getCurrentFormattedFilename() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
}

/**
 * Updates the current session log file with a new log entry.
 * @param level One of "request", "error", "fatalerror", "generic"
 * @param text The log message text
 */
export function updateLogFile(level: "request" | "error" | "fatalerror" | "generic", text: string) {
	if (!SESSION_LOGFILE) {
		console.error('Log file not initialized. Call start() before writing logs.');
		return;
	}

	const logLevel = LOGLEVELS[level] ?? LOGLEVELS.generic;

	const timestamp = getCurrentFormattedDateTime();
	const logEntry = `${logLevel} ${timestamp} "${text}"\n`;

	try {
		fs.writeFileSync(SESSION_LOGFILE, logEntry, { encoding: 'utf8', flag: 'a' }); // Append mode
	} catch (err) {
		console.error('Error writing file:', err);
	}
}

/**
 * Optionally call this function on process termination if you want to clear the session record.
 */
export function clearSession() {
    try {
        if (fs.existsSync(SESSION_FILE_RECORD)) {
            fs.unlinkSync(SESSION_FILE_RECORD);
            console.log('[LOGS] Session cleared.');
        }
    } catch (err) {
        console.error('[ERROR] Could not clear session record file:', err);
    }
}

