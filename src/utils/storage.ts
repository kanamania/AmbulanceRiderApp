/**
 * Local storage utility functions
 * Provides a safe wrapper around localStorage with error handling
 */

export const storage = {
  /**
   * Get item from localStorage
   */
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  },

  /**
   * Check if key exists in localStorage
   */
  has: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking if key exists in localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Get all keys from localStorage
   */
  keys: (): string[] => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting keys from localStorage', error);
      return [];
    }
  },

  /**
   * Get storage size in bytes
   */
  getSize: (): number => {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Error calculating localStorage size', error);
      return 0;
    }
  },
};

/**
 * Session storage utility functions
 */
export const sessionStorage = {
  /**
   * Get item from sessionStorage
   */
  get: <T>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from sessionStorage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in sessionStorage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in sessionStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Remove item from sessionStorage
   */
  remove: (key: string): boolean => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from sessionStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Clear all items from sessionStorage
   */
  clear: (): boolean => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
      return false;
    }
  },
};
