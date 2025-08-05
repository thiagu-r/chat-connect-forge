import { apiService } from './api';

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

export class TokenUtils {
  /**
   * Manually test token refresh functionality
   */
  static async testTokenRefresh(): Promise<TokenRefreshResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available in localStorage');
      }

      console.log('Testing token refresh with:', refreshToken);
      
      const response = await apiService.refreshToken();
      console.log('Token refresh successful:', response);
      
      return response;
    } catch (error) {
      console.error('Token refresh test failed:', error);
      throw error;
    }
  }

  /**
   * Check if current access token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error parsing token expiration:', error);
      return null;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp - currentTime;
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return 0;
    }
  }

  /**
   * Force refresh token (useful for testing)
   */
  static async forceRefreshToken(): Promise<void> {
    try {
      const newTokens = await apiService.refreshToken();
      localStorage.setItem('access_token', newTokens.access_token);
      localStorage.setItem('refresh_token', newTokens.refresh_token);
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }
} 