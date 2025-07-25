import prisma from "../lib/prisma";
import LOGGER_SESSION from "../lib/logger";
import { SCHEMA_USERNAME, SCHEMA_USERBIO, SCHEMA_USERTITLE } from "../validation";

// Updating the username
export async function updateUsername(userId: string, newUsername: string) {
	const { error } = SCHEMA_USERNAME.validate(newUsername);
	if (error) throw new Error("Invalid username");
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { username: newUsername },
		});
		LOGGER_SESSION.log(
			"generic",
			`Updated username for ${userId}: ${newUsername}`
		);
		return updatedUser;
	} catch (error) {
		console.error("Username update error:", error);
		throw error;
	}
}

// Updating the title
export async function entitle(userId: string, newTitle: string) {
	const { error } = SCHEMA_USERTITLE.validate(newTitle);
	if (error) throw new Error("Invalid title");

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { title: newTitle },
		});
		LOGGER_SESSION.log("generic", `Updated title for ${userId}: ${newTitle}`);
		return updatedUser;
	} catch (error) {
		LOGGER_SESSION.log("error", `Couldn't entitle user ID ${userId}: ${error}`);
		throw error;
	}
}

// Updating the bio
export async function updateBio(userId: string, newBio: string) {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: { bio: newBio },
		});
		LOGGER_SESSION.log("generic", `Updated bio for ${userId}`);
	} catch (error) {
		LOGGER_SESSION.log("error", `Couldn't update bio for user ID ${userId}: ${error}`);
		throw error;
	}
}

// Toggling supporter status
export async function toggleSupporter(userId: string, status: boolean) {
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { isSupporter: status },
		});
		LOGGER_SESSION.log(
			"generic",
			`Toggled supporter for ${userId}: ${status}`
		);
		return updatedUser;
	} catch (error) {
		console.error("Supporter toggle error:", error);
		throw error;
	}
}

// Removing the user
export async function remove(userId: string) {
	try {
		const deletedUser = await prisma.user.delete({
			where: { id: userId },
		});
		LOGGER_SESSION.log("generic", `Removed user: ${userId}`);
		return deletedUser;
	} catch (error) {
		console.error("Remove user error:", error);
		throw error;
	}
}

export async function updateProfile(
	userId: string,
	updates: {
		username?: string;
		title?: string;
		profilePicture?: string;
		preferences?: any;
	}
) {
	
	if (updates.username) {
		const { error } = SCHEMA_USERNAME.validate(updates.username);
		if (error) throw new Error("Invalid username");
	}

	if (updates.title) {
		const { error } = SCHEMA_USERTITLE.validate(updates.title);
		if (error) throw new Error("Invalid title");
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { ...updates },
		});
		LOGGER_SESSION.log("generic", `Updated profile for ${userId}`);
		return updatedUser;
	} catch (error) {
		console.error("Profile update error:", error);
		throw error;
	}
}

export async function create(userData: {
	telegramId: string;
	username: string;
	passwordHash: string;
	profilePicture?: string;
}) {
	const usernameValidation = SCHEMA_USERNAME.validate(userData.username);
	if (usernameValidation.error) {
		throw new Error("Username must be 5-15 characters");
	}
	if (!userData.passwordHash || userData.passwordHash.length < 10) {
		throw new Error("Password hash is required and must be valid");
	}
	try {
		const newUser = await prisma.user.create({
			data: {
				telegramId: userData.telegramId,
				username: userData.username,
				passwordHash: userData.passwordHash,
				isSupporter: false,
				title: "New User",
				profilePicture: userData.profilePicture || "",
			},
			select: {
				id: true,
				telegramId: true,
				username: true,
				title: true,
				isSupporter: true,
				profilePicture: true,
				createdAt: true,
			},
		});
		LOGGER_SESSION.log("generic", `Created new user: ${newUser.id}`);
		return newUser;
	} catch (error) {
		LOGGER_SESSION.log("error", `Failed to create new user for telegramId ${userData.telegramId}`);
		throw error;
	}
}

export async function getUserById(userId: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				telegramId: true,
				title: true,
				profilePicture: true,
				isSupporter: true,
				createdAt: true,
				updatedAt: true,
				preferences: true,
			},
		});
		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}
		return user;
	} catch (error) {
		console.error("Get user error:", error);
		throw error;
	}
}

export async function getUserByUsername(username: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { username },
			select: {
				id: true,
				username: true,
				telegramId: true,
				title: true,
				profilePicture: true,
				isSupporter: true,
				createdAt: true,
			},
		});
		return user;
	} catch (error) {
		console.error("Get user by username error:", error);
		throw error;
	}
}

export async function getUserByTelegramId(telegramId: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { telegramId },
		});
		return user;
	} catch (error) {
		console.error("Get user by telegramId error:", error);
		throw error;
	}
}

export async function updatePreferences(userId: string, preferences: any) {
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { preferences },
		});
		LOGGER_SESSION.log("generic", `Updated preferences for user ${userId}`);
		return updatedUser;
	} catch (error) {
		console.error("Preferences update error:", error);
		throw error;
	}
}

export async function checkUsernameExists(username: string) {
	try {
		const updatedUser = await prisma.user.findUnique({
			where: { username: username },
		});
		if (updatedUser) {return true;}
	} catch (error) {
		return false;
	}
}

export async function getUserStars(userId: string) {
	try {
		const stars = await prisma.pluginStars.findMany({
			where: { userId },
			include: {
				plugin: {
					select: {
						id: true,
						name: true,
						description: true,
						createdAt: true,
					},
				},
			},
		});
		return stars;
	} catch (error) {
		console.error("Get user stars error:", error);
		throw error;
	}
}