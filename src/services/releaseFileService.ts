import { mkdir, rm, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { BunFile } from "bun";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export async function createRelease(pluginId: string, releaseId: string, file: BunFile, filename: string) {
	const pluginDir = path.join(STORAGE_ROOT, pluginId);
	const releaseDir = path.join(pluginDir, releaseId);

	if (!existsSync(pluginDir)) {
		await mkdir(pluginDir, { recursive: true });
	}

	if (!existsSync(releaseDir)) {
		await mkdir(releaseDir, { recursive: true });
	}
	
	const filePath = path.join(releaseDir, filename);
	await Bun.write(filePath, file);

	return filePath;
}

export async function getReleaseFile(pluginId: string, releaseId: string, filename: string): Promise<BunFile | null> {
	const filePath = path.join(STORAGE_ROOT, pluginId, releaseId, filename);
	if (!existsSync(filePath)) return null;
	return Bun.file(filePath);
}

export async function getAllReleaseFiles(pluginId: string): Promise<string[]> {
	const pluginDir = path.join(STORAGE_ROOT, pluginId);
	if (!existsSync(pluginDir)) return [];
	const releaseDirs = await readdir(pluginDir, { withFileTypes: true });
	const files: string[] = [];
	for (const dirent of releaseDirs) {
		if (dirent.isDirectory()) {
			const releaseDir = path.join(pluginDir, dirent.name);
			const releaseFiles = await readdir(releaseDir);
			for (const file of releaseFiles) {
				files.push(path.join(dirent.name, file));
			}
		}
	}
	return files;
}

export async function deleteRelease(pluginId: string, releaseId: string) {
	const releaseDir = path.join(STORAGE_ROOT, pluginId, releaseId);
	if (existsSync(releaseDir)) {
		await rm(releaseDir, { recursive: true, force: true });
		return true;
	}
	return false;
}

export async function deleteAllPluginReleases(pluginId: string) {
	const pluginDir = path.join(STORAGE_ROOT, pluginId);
	if (existsSync(pluginDir)) {
		await rm(pluginDir, { recursive: true, force: true });
		return true;
	}
	return false;
}

