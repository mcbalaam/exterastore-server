export const TARGET_PLATFORM_AYU = "AyuGram";
export const TARGET_PLATFORM_EXTERA = "exteraGram";

export const TAG_UTILITY = "Utility";
export const TAG_FUN = "Fun";
export const TAG_INTERFACE = "Interface";
export const TAG_MEDIA = "Media";
export const TAG_PRODUCTIVITY = "Productivity";
export const TAG_SOCIAL = "Social";
export const TAG_CUSTOMIZATION = "Customization";
export const TAG_DEVELOPER = "Developer";
export const TAG_LIBRARY = "Library";

export const ALL_TAGS = [
	TAG_UTILITY,
	TAG_FUN,
	TAG_INTERFACE,
	TAG_MEDIA,
	TAG_PRODUCTIVITY,
	TAG_SOCIAL,
	TAG_CUSTOMIZATION,
	TAG_DEVELOPER,
	TAG_LIBRARY,
] as const;

export type Tag = (typeof ALL_TAGS)[number];
export function isValidTag(value: string): value is Tag {
	return ALL_TAGS.includes(value as Tag);
}

export function validateTags(tags: string[]): Tag[] {
	return tags.filter(isValidTag);
}

export const STATUS_INVALID_NAME = {
	error: "Invalid plugin name",
	code: "INVALID_NAME",
};
export const STATUS_INVALID_DESCRIPTION = {
	error: "Invalid description",
	code: "INVALID_DESCRIPTION",
};
export const STATUS_INVALID_AUTHOR = {
	error: "Author not found",
	code: "INVALID_AUTHOR",
};
export const STATUS_INVALID_LICENSE = {
	error: "Invalid license",
	code: "INVALID_LICENSE",
};
export const STATUS_INVALID_PLATFORM = {
	error: "Invalid target platform",
	code: "INVALID_PLATFORM",
};
export const STATUS_INVALID_TAGS = {
	error: "Invalid tags",
	code: "INVALID_TAGS",
};
export const STATUS_FORK_NOT_FOUND = {
	error: "Fork origin not found",
	code: "FORK_NOT_FOUND",
};
export const STATUS_DEPENDENCY_NOT_FOUND = {
	error: "Dependency not found",
	code: "DEPENDENCY_NOT_FOUND",
};
export const STATUS_CIRCULAR_DEPENDENCY = {
	error: "Circular dependency detected",
	code: "CIRCULAR_DEPENDENCY",
};
export const STATUS_SELF_DEPENDENCY = {
	error: "Plugin cannot depend on itself",
	code: "SELF_DEPENDENCY",
};
export const STATUS_ERR = {
	error: "Internal server error",
	code: "INTERNAL_ERROR",
};
export const STATUS_SUC = "Success";
