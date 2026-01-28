import logger from "../lib/logger";
import { prisma } from "../lib/prisma";
import { SCHEMA_USERBIO, SCHEMA_USERNAME } from "../lib/validation";

export async function createUser(userData: {
	telegramId: string;
	username: string;
	passwordHash: string;
	userBio?: string;
	profilePicture?: string;
}) {
	const usernameValidation = SCHEMA_USERNAME.validate(userData.username);
	if (usernameValidation.error) {
		return new Error("Username must be 5-15 characters");
	}

	const bioValidation = SCHEMA_USERBIO.validate(userData.profilePicture);
	if (bioValidation.error) {
		return new Error("Bio must be no longer than 200 characters.");
	}

	if (!userData.passwordHash || userData.passwordHash.length < 10) {
		return new Error("Password hash is required and must be valid");
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
		logger.info(`Created new user: ${newUser.id}`);
		return newUser;
	} catch (error) {
		logger.error(
			`Failed to create new user for telegramId ${userData.telegramId}`,
		);
		throw error;
	}
}

// Removing the user
export async function removeUser(userId: string) {
	try {
		const deletedUser = await prisma.user.delete({
			where: { id: userId },
		});
		logger.info(`Removed user: ${userId}`);
		return deletedUser;
	} catch (error) {
		logger.error(`Remove user error:", ${error}`);
		throw error;
	}
}