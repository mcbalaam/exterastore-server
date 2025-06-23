export interface exteraPlugin {
	id: string,
	name: string,
	license: "Apache 2.0" | "GPL 3.0" | "MIT"
	description?: string,
}

export type exteraPluginStrict = {
	id: string;
	name: string;
	license: "Apache 2.0" | "GPL 3.0" | "MIT"
	description: string | null;
	forkOriginId: string | null;
	reactions: Record<string, any>; 
	createdAt: Date;
	updatedAt: Date;
	targetPlatform: string[];
	tags: Record<string, any> | null; 
	isHidden: boolean;
	hiddenReason: string | null;

	releases: [];
	stars: [];
	forkOrigin: exteraPlugin | null;
	forks: exteraPlugin[];
};

