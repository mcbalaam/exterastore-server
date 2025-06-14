import { user } from "./api/users";

export class pluginRelease {
	releaseHash: string;
	releaseNotes?: string;
	file: string;
	reactions?: [];

	constructor(releaseHash: string, releaseNotes: string, file: string, reactions?: []) {
		this.releaseHash = releaseHash;
		this.releaseNotes = releaseNotes;
		this.file = file;
		this.reactions = reactions;
	}
}

export class exteraPlugin {
	name: string;
	description: string;
	author: user;
	// comments?: list[userComment];
	releases: [pluginRelease];
	reactions?: []

	constructor(name: string, description: string, releases: [pluginRelease], author: user, reactions?: []) {
		this.name = name;
		this.description = description;
		this.reactions = reactions;
		this.releases = releases;
		this.author = author;
	}
}