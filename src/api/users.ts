// список команд: add, edit, entitle, togglesupporter, remove

// user edit (username | bio | password | pfp) "string"
// user entitle "string"
// user togglesupporter "true" | "false"
import { PrismaClient } from '@prisma/client';
import { updateLogFile } from '../lib/logger';

export class user {
	// id: string;
	// username: string;
	// title?: string;
	// timeoutDue?: number;
	// profilePicture: string;
	// isSupporter: false | true;

	// constructor(id: string, username: string, profilePictire: string, isSupporter: boolean, timeoutDue?: number, title?: "") {
	// 	this.id = id;
	// 	this.username = username;
	// 	this.timeoutDue = timeoutDue;
	// 	this.profilePicture = profilePictire;
	// 	this.isSupporter = isSupporter;
	// }

	async entitle(userId: string, newTitle: string) {
		const prisma = new PrismaClient();
		try {
			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { title: newTitle },
			});
			updateLogFile("generic", `Updated title for ${userId}: ${newTitle}`)
		} catch (error) {
			console.error('Error updating user:', error);
		} finally {
			await prisma.$disconnect();
		}
	}

	async updateUsername(userId: string, newUsername: string) {
		const prisma = new PrismaClient();
		try {
			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { username: newUsername },
			});
			updateLogFile("generic", `Updated username for ${userId}: ${newUsername}`)
		} catch (error) {
			console.error('Error updating user:', error);
		} finally {
			await prisma.$disconnect();
		}
	}

	async updateDescription(userId: string, newDescription: string) {
		const prisma = new PrismaClient();
		try {
			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { description: newDescription },
			});
			console.log('User updated:', updatedUser);
		} catch (error) {
			console.error('Error updating user:', error);
		} finally {
			await prisma.$disconnect();
		}
	}
}

