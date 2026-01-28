import logger from "../lib/logger";
import { prisma } from "../lib/prisma";
import { SCHEMA_USERNAME, SCHEMA_USERTITLE } from "../lib/validation";

// Updating the username
export async function updateUsername(userId: string, newUsername: string) {
	const { error } = SCHEMA_USERNAME.validate(newUsername);
	if (error) throw new Error("Invalid username");
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { username: newUsername },
		});
		logger.info(
			`Updated username for ${userId}: ${newUsername}`,
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
		logger.info(`Updated title for ${userId}: ${newTitle}`);
		return updatedUser;
	} catch (error) {
		logger.error(`Couldn't entitle user ID ${userId}: ${error}`);
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
		logger.info(`Updated bio for ${userId}`);
	} catch (error) {
		logger.error(
			`Couldn't update bio for user ID ${userId}: ${error}`,
		);
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
		logger.info(`Toggled supporter for ${userId}: ${status}`);
		return updatedUser;
	} catch (error) {
		logger.error(`Supporter toggle error:", ${error}`);
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
	},
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
		logger.info(`Updated profile for ${userId}`);
		return updatedUser;
	} catch (error) {
		logger.error(`Error updating user profile:", ${error}`);
		throw error;
	}
}

export async function updatePreferences(userId: string, preferences: any) {
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { preferences },
		});
		logger.info(`Updated preferences for user ${userId}`);
		return updatedUser;
	} catch (error) {
		logger.error(`Preferences update error:", ${error}`);
		throw error;
	}
}

