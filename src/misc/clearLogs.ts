import * as fs from "fs";
import * as path from "path";

const LOGPATH = path.join(__dirname, "..", "..", "logs");

if (fs.existsSync(LOGPATH)) {
	const files = fs.readdirSync(LOGPATH);
	
	files.forEach(file => {
		const filePath = path.join(LOGPATH, file);
		
		if (fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});
	
	console.log("Log history cleared");
} else {
    console.log("`logs` directory not found");
}
