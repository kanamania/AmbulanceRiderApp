/**
 * Validation utility functions
 */

export const validators = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * At least 6 characters
   */
  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  /**
   * Validate phone number format
   * Accepts various formats: +1234567890, (123) 456-7890, etc.
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate name (at least 2 characters, letters and spaces only)
   */
  isValidName: (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name);
  },

  /**
   * Check if string is empty or only whitespace
   */
  isEmpty: (value: string): boolean => {
    return !value || value.trim().length === 0;
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Check if two values match (for password confirmation)
   */
  matches: (value1: string, value2: string): boolean => {
    return value1 === value2;
  },
};

/**
 * Form validation helper
 */
export const validateForm = {
  /**
   * Validate login form
   */
  login: (email: string, password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (validators.isEmpty(email)) {
      errors.push('Email is required');
    } else if (!validators.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (validators.isEmpty(password)) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate registration form
   */
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (validators.isEmpty(name)) {
      errors.push('Name is required');
    } else if (!validators.isValidName(name)) {
      errors.push('Name must be at least 2 characters and contain only letters');
    }

    if (validators.isEmpty(email)) {
      errors.push('Email is required');
    } else if (!validators.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (validators.isEmpty(password)) {
      errors.push('Password is required');
    } else if (!validators.isValidPassword(password)) {
      errors.push('Password must be at least 6 characters');
    }

    if (validators.isEmpty(confirmPassword)) {
      errors.push('Please confirm your password');
    } else if (!validators.matches(password, confirmPassword)) {
      errors.push('Passwords do not match');
    }

    if (phone && !validators.isEmpty(phone) && !validators.isValidPhone(phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate profile update form
   */
  profile: (name: string, email: string, phone?: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (validators.isEmpty(name)) {
      errors.push('Name is required');
    } else if (!validators.isValidName(name)) {
      errors.push('Name must be at least 2 characters and contain only letters');
    }

    if (validators.isEmpty(email)) {
      errors.push('Email is required');
    } else if (!validators.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (phone && !validators.isEmpty(phone) && !validators.isValidPhone(phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
