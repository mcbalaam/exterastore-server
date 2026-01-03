import logger from "./logger";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";

export class UserClient {
  private baseUrl: string;

  constructor(baseUrl: string = USER_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  async getUser(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          logger.warn("User not found", { userId });
          return null;
        }
        throw new Error(`User service returned ${response.status}`);
      }
      
      const user = await response.json();
      logger.debug("User fetched", { userId });
      return user;
      
    } catch (error) {
      logger.error("Failed to fetch user", { 
        userId, 
        error: error instanceof Error ? error.message : error 
      });
      return null;
    }
  }

  async getUsersByIds(userIds: string[]) {
    if (userIds.length === 0) return [];

    try {
      const response = await fetch(`${this.baseUrl}/users/batch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ ids: userIds })
      });
      
      if (!response.ok) {
        throw new Error(`User service returned ${response.status}`);
      }
      
      const users = await response.json();
      logger.debug("Users batch fetched", { count: users.length });
      return users;
      
    } catch (error) {
      logger.error("Failed to fetch users batch", { 
        userIds, 
        error: error instanceof Error ? error.message : error 
      });
      return [];
    }
  }

  async validateUser(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return !!user;
  }

  async getUserByUsername(username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/by-username/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`User service returned ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error("Failed to fetch user by username", { 
        username, 
        error: error instanceof Error ? error.message : error 
      });
      return null;
    }
  }

  async searchUsers(query: string, limit: number = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`User service returned ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error("Failed to search users", { 
        query, 
        error: error instanceof Error ? error.message : error 
      });
      return [];
    }
  }
}

export const userClient = new UserClient();

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  title?: string;
  isSupporter: boolean;
  createdAt: string;
}
