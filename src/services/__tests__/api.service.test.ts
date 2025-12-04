import { describe, it, expect } from 'vitest';
import apiService from '../api.service';

describe('ApiService', () => {
  describe('initialization', () => {
    it('should have axios instance defined', () => {
      expect(apiService).toBeDefined();
    });

    it('should have get method', () => {
      expect(typeof apiService.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof apiService.post).toBe('function');
    });

    it('should have put method', () => {
      expect(typeof apiService.put).toBe('function');
    });

    it('should have patch method', () => {
      expect(typeof apiService.patch).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof apiService.delete).toBe('function');
    });
  });

  describe('getInstance', () => {
    it('should return the axios instance', () => {
      const instance = apiService.getInstance();
      expect(instance).toBeDefined();
      expect(typeof instance.get).toBe('function');
      expect(typeof instance.post).toBe('function');
    });

    it('should have interceptors configured', () => {
      const instance = apiService.getInstance();
      expect(instance.interceptors).toBeDefined();
      expect(instance.interceptors.request).toBeDefined();
      expect(instance.interceptors.response).toBeDefined();
    });
  });
});
