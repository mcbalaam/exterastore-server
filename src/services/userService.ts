import prisma from "../lib/prisma";
import Joi from "joi";
import * as bcrypt from "bcrypt";
import LOGGER_SESSION from "..";

export default class UserService {
  static usernameSchema = Joi.string().min(5).max(15);
  static titleSchema = Joi.string().min(0).max(50);
  static bioSchema = Joi.string().min(0).max(150);
  static emailSchema = Joi.string()
    .email()
    .min(5)
    .max(40)
    .required()
    .lowercase()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    });

  // Updating the username
  async updateUsername(userId: string, newUsername: string) {
    const { error } = UserService.usernameSchema.validate(newUsername);
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
  async entitle(userId: string, newTitle: string) {
    const { error } = UserService.titleSchema.validate(newTitle);
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
  async updateBio(userId: string, newBio: string) {
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
  async toggleSupporter(userId: string, status: boolean) {
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
  async remove(userId: string) {
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

  async updateProfile(
    userId: string,
    updates: {
      username?: string;
      title?: string; // Изменено с description на title
      profilePicture?: string;
      preferences?: any; // Добавлено для Json поля
    }
  ) {
    // Валидация данных
    if (updates.username) {
      const { error } = UserService.usernameSchema.validate(updates.username);
      if (error) throw new Error("Invalid username");
    }

    if (updates.title) {
      const { error } = UserService.titleSchema.validate(updates.title);
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

  async create(userData: {
    email: string;
    username: string;
    password: string;
    profilePicture?: string;
  }) {
    const emailValidation = UserService.emailSchema.validate(userData.email);
    if (emailValidation.error) {
      throw new Error(emailValidation.error.details[0].message);
    }

    const usernameValidation = UserService.usernameSchema.validate(
      userData.username
    );
    if (usernameValidation.error) {
      throw new Error("Username must be 5-15 characters");
    }

    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          username: userData.username,
          passwordHash: hashedPassword, // Исправлено: используем passwordHash
          isSupporter: false,
          title: "New User",
          profilePicture: userData.profilePicture || "", // Обязательное поле
        },
        select: {
          id: true,
          email: true,
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
      LOGGER_SESSION.log(
        "error",
        `Failed to create new user for ${userData.email}`
      );
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
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

  async getUserByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
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

  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase() },
      });

      return user;
    } catch (error) {
      console.error("Get user by email error:", error);
      throw error;
    }
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      LOGGER_SESSION.log("generic", `Updated password for user ${userId}`);
      return updatedUser;
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  }

  async updatePreferences(userId: string, preferences: any) {
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

  async getUserStars(userId: string) {
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
}

export const userService = new UserService();
