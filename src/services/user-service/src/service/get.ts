import logger from "../lib/logger";
import { prisma } from "../lib/prisma";

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

export async function checkUsernameExists(username: string) {
	try {
		const updatedUser = await prisma.user.findUnique({
			where: { username: username },
		});
		if (updatedUser) {
			return true;
		}
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
