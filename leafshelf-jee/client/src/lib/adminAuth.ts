const SESSION_KEY = 'leafshelf:admin:session';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin123';

export const adminAuth = {
  login(username: string, password: string): boolean {
    if (username.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return localStorage.getItem(SESSION_KEY) === 'true';
  },
};
