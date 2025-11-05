/**
 * Avatar Utilities
 * Provides default avatar generation and helper functions
 */

/**
 * Default avatar URL - using a neutral, professional avatar
 */
export const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api/?background=3880ff&color=fff&size=200&rounded=true&bold=true';

/**
 * Generate a personalized avatar URL based on user's name
 * Uses ui-avatars.com API to generate avatar with initials
 * 
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param size - Avatar size in pixels (default: 200)
 * @returns URL for generated avatar
 */
export const getDefaultAvatar = (
  firstName?: string,
  lastName?: string,
  size: number = 200
): string => {
  if (!firstName && !lastName) {
    return `https://ui-avatars.com/api/?background=3880ff&color=fff&size=${size}&rounded=true&bold=true&name=User`;
  }

  const name = `${firstName || ''} ${lastName || ''}`.trim();
  const encodedName = encodeURIComponent(name);
  
  return `https://ui-avatars.com/api/?background=3880ff&color=fff&size=${size}&rounded=true&bold=true&name=${encodedName}`;
};

/**
 * Get user avatar URL with fallback to generated avatar
 * 
 * @param imageUrl - User's uploaded image URL
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param size - Avatar size in pixels (default: 200)
 * @returns URL for user avatar
 */
export const getUserAvatar = (
  imageUrl?: string | null,
  firstName?: string,
  lastName?: string,
  size: number = 200
): string => {
  if (imageUrl) {
    return imageUrl;
  }
  
  return getDefaultAvatar(firstName, lastName, size);
};

/**
 * Get user initials for avatar display
 * 
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Initials string (e.g., "JD" for John Doe)
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  
  if (!first && !last) {
    return 'U';
  }
  
  return `${first}${last}`;
};

/**
 * Generate a color based on user's name (for consistent avatar backgrounds)
 * 
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Hex color code
 */
export const getAvatarColor = (firstName?: string, lastName?: string): string => {
  const colors = [
    '#3880ff', // Primary blue
    '#5260ff', // Indigo
    '#2dd36f', // Success green
    '#ffc409', // Warning yellow
    '#eb445a', // Danger red
    '#92949c', // Medium gray
    '#0cd1e8', // Cyan
    '#ee55ff', // Purple
  ];

  const name = `${firstName || ''}${lastName || ''}`;
  if (!name) {
    return colors[0];
  }

  // Generate a consistent index based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
