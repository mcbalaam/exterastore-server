import prisma from '../lib/prisma';
import { updateLogFile } from '../lib/logger';
import Joi from 'joi';


class UserService {
  static usernameSchema = Joi.string().min(5).max(15);
  static descriptionSchema = Joi.string().min(0).max(50);
  static emailSchema = Joi.string()
    .email()
    .min(5)
    .max(40)
    .required()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    });

  // Updating the username
  async updateUsername(userId: string, newUsername: string) {
    const { error } = UserService.usernameSchema.validate(newUsername);
    if (error) throw new Error('Invalid username');
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { username: newUsername },
      });
      updateLogFile("generic", `Updated username for ${userId}: ${newUsername}`);
    } catch (error) {
      console.error('Username update error:', error);
      throw error;
    }
  }

	// Updating the title
  async entitle(userId: string, newTitle: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { title: newTitle },
      });
      updateLogFile("generic", `Updated title for ${userId}: ${newTitle}`);
    } catch (error) {
      console.error('Entitle error:', error);
      throw error;
    }
  }

  // Updating the desctiption
  async updateDescription(userId: string, newDescription: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { description: newDescription },
      });
      updateLogFile("generic", `Updated description for ${userId}`);
    } catch (error) {
      console.error('Description update error:', error);
      throw error;
    }
  }

  // Toggling supporter status
  async toggleSupporter(userId: string, status: boolean) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isSupporter: status },
      });
      updateLogFile("generic", `Toggled supporter for ${userId}: ${status}`);
    } catch (error) {
      console.error('Supporter toggle error:', error);
      throw error;
    }
  }

  // Removing the user
  async remove(userId: string) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      updateLogFile("generic", `Removed user: ${userId}`);
    } catch (error) {
      console.error('Remove user error:', error);
      throw error;
    }
  }

	async updateProfile(
		userId: string, 
		updates: {
			username?: string;
			description?: string;
			profilePicture?: string;
		}
	) {
		await prisma.user.update({
			where: { id: userId },
			data: { ...updates },
		});
	}

}

export const userService = new UserService();