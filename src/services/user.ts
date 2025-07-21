/**
 * User service for managing user profiles and admin status
 */
import { apiClient } from './api';

export interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

class UserService {
  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/users/me', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Check if current user is admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUser();
      return profile.is_admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export for type checking and testing
export default UserService;
