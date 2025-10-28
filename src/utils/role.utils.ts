// Role-based access control utilities
export const ROLES = {
  ADMIN: 'Admin',
  DISPATCHER: 'Dispatcher',
  DRIVER: 'Driver',
  USER: 'User'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const hasRole = (user: { roles: string[] } | null, ...roles: UserRole[]): boolean => {
  if (!user) return false;
  return user.roles.some(role => roles.includes(role as UserRole));
};

export const hasAnyRole = (user: { roles: string[] } | null): boolean => {
  return !!user?.roles?.length;
};

export const getHighestRole = (user: { roles: string[] } | null): UserRole | null => {
  if (!user?.roles?.length) return null;
  
  // Define role hierarchy
  const roleHierarchy = [
    ROLES.ADMIN,
    ROLES.DISPATCHER,
    ROLES.DRIVER,
    ROLES.USER
  ];
  
  // Find the highest role the user has
  for (const role of roleHierarchy) {
    if (user.roles.includes(role)) {
      return role as UserRole;
    }
  }
  
  return ROLES.USER; // Default to USER if no role is found
};

export const getDefaultRoute = (user: { roles: string[] } | null): string => {
  const role = getHighestRole(user);
  
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.DISPATCHER:
      return '/dispatcher/console';
    case ROLES.DRIVER:
      return '/driver/assignments';
    case ROLES.USER:
    default:
      return '/home';
  }
};
