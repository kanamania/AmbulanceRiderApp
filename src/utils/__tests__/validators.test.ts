import { describe, it, expect } from 'vitest';
import { validators, validateForm } from '../validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(validators.isValidEmail('test@example.com')).toBe(true);
      expect(validators.isValidEmail('user.name@domain.org')).toBe(true);
      expect(validators.isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validators.isValidEmail('')).toBe(false);
      expect(validators.isValidEmail('invalid')).toBe(false);
      expect(validators.isValidEmail('invalid@')).toBe(false);
      expect(validators.isValidEmail('@domain.com')).toBe(false);
      expect(validators.isValidEmail('user@')).toBe(false);
      expect(validators.isValidEmail('user name@domain.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 6+ characters', () => {
      expect(validators.isValidPassword('123456')).toBe(true);
      expect(validators.isValidPassword('password123')).toBe(true);
      expect(validators.isValidPassword('StrongP@ss!')).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(validators.isValidPassword('')).toBe(false);
      expect(validators.isValidPassword('12345')).toBe(false);
      expect(validators.isValidPassword('abc')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(validators.isValidPhone('+1234567890')).toBe(true);
      expect(validators.isValidPhone('1234567890')).toBe(true);
      expect(validators.isValidPhone('123-456-7890')).toBe(true);
      expect(validators.isValidPhone('+255712345678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validators.isValidPhone('')).toBe(false);
      expect(validators.isValidPhone('abc')).toBe(false);
      expect(validators.isValidPhone('12')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(validators.isValidName('John')).toBe(true);
      expect(validators.isValidName('John Doe')).toBe(true);
      expect(validators.isValidName('Mary Jane Watson')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(validators.isValidName('')).toBe(false);
      expect(validators.isValidName('A')).toBe(false);
      expect(validators.isValidName('John123')).toBe(false);
      expect(validators.isValidName('John@Doe')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty or whitespace strings', () => {
      expect(validators.isEmpty('')).toBe(true);
      expect(validators.isEmpty('   ')).toBe(true);
      expect(validators.isEmpty('\t\n')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(validators.isEmpty('hello')).toBe(false);
      expect(validators.isEmpty(' hello ')).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length correctly', () => {
      expect(validators.minLength('hello', 3)).toBe(true);
      expect(validators.minLength('hi', 3)).toBe(false);
      expect(validators.minLength('abc', 3)).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length correctly', () => {
      expect(validators.maxLength('hi', 5)).toBe(true);
      expect(validators.maxLength('hello', 5)).toBe(true);
      expect(validators.maxLength('hello world', 5)).toBe(false);
    });
  });

  describe('matches', () => {
    it('should return true when values match', () => {
      expect(validators.matches('password', 'password')).toBe(true);
      expect(validators.matches('', '')).toBe(true);
    });

    it('should return false when values do not match', () => {
      expect(validators.matches('password', 'different')).toBe(false);
      expect(validators.matches('Password', 'password')).toBe(false);
    });
  });
});

describe('validateForm', () => {
  describe('login', () => {
    it('should validate valid login form', () => {
      const result = validateForm.login('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for empty email', () => {
      const result = validateForm.login('', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should return errors for invalid email', () => {
      const result = validateForm.login('invalid-email', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should return errors for empty password', () => {
      const result = validateForm.login('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return multiple errors for invalid form', () => {
      const result = validateForm.login('', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('register', () => {
    it('should validate valid registration form', () => {
      const result = validateForm.register('John Doe', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for empty name', () => {
      const result = validateForm.register('', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should return errors for invalid name', () => {
      const result = validateForm.register('J', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be at least 2 characters and contain only letters');
    });

    it('should return errors for password mismatch', () => {
      const result = validateForm.register('John Doe', 'test@example.com', 'password123', 'different');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    it('should return errors for short password', () => {
      const result = validateForm.register('John Doe', 'test@example.com', '12345', '12345');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters');
    });

    it('should validate optional phone number when provided', () => {
      const result = validateForm.register('John Doe', 'test@example.com', 'password123', 'password123', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    it('should accept valid phone number', () => {
      const result = validateForm.register('John Doe', 'test@example.com', 'password123', 'password123', '+1234567890');
      expect(result.isValid).toBe(true);
    });
  });

  describe('profile', () => {
    it('should validate valid profile form', () => {
      const result = validateForm.profile('John Doe', 'test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid profile data', () => {
      const result = validateForm.profile('', 'invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate optional phone when provided', () => {
      const result = validateForm.profile('John Doe', 'test@example.com', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });
  });
});
