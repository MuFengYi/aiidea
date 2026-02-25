import { apiService } from './api';

class AuthManager {
  private static instance: AuthManager;
  private isAuthenticated = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Check if user is authenticated
  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    this.isAuthenticated = !!token; // Update internal state based on token
    return !!token;
  }

  // Login with credentials
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.login(email, password);
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  // Register new user
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    language?: string;
  }): Promise<boolean> {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
  }

  // Get current user info
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Initialize authentication state
  initialize(): void {
    const token = localStorage.getItem('accessToken');
    this.isAuthenticated = !!token;
  }

  // Demo login for testing (creates a test user session)
  async demoLogin(): Promise<boolean> {
    try {
      // For demo purposes, we'll try to register and login a test user
      const testUser = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        language: 'zh'
      };

      // Try to register first (will fail if user exists, which is okay)
      try {
        await this.register(testUser);
        return true;
      } catch (registerError) {
        // If registration fails (user exists), try to login
        return await this.login(testUser.email, testUser.password);
      }
    } catch (error) {
      console.error('Demo login failed:', error);
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();