/**
 * Formatting utility functions
 */

export const formatters = {
  /**
   * Format phone number to a standard format
   * Example: +1234567890 -> +1 (234) 567-890
   */
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  },

  /**
   * Format date to readable string
   */
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format date and time
   */
  formatDateTime: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format time ago (e.g., "2 hours ago")
   */
  formatTimeAgo: (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return formatters.formatDate(date);
    }
  },

  /**
   * Capitalize first letter of each word
   */
  capitalizeWords: (str: string): string => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format distance (meters to km/miles)
   */
  formatDistance: (meters: number, unit: 'metric' | 'imperial' = 'metric'): string => {
    if (unit === 'metric') {
      if (meters < 1000) {
        return `${Math.round(meters)} m`;
      }
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      const miles = meters * 0.000621371;
      if (miles < 0.1) {
        return `${Math.round(meters * 3.28084)} ft`;
      }
      return `${miles.toFixed(1)} mi`;
    }
  },
};
