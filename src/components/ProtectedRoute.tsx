import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { IonSpinner, IonContent, IonPage, IonAlert } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/role.utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * List of roles that are allowed to access this route
   * If not provided, any authenticated user can access the route
   */
  allowedRoles?: string[];
  /**
   * Redirect path when user doesn't have required role
   * Defaults to '/' (home) or login page if not authenticated
   */
  redirectPath?: string;
  /**
   * If true, will redirect to the first allowed role's default route
   * instead of the specified redirectPath
   */
  redirectToRoleDefault?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath,
  redirectToRoleDefault = false,
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    hasRole, 
    getDefaultRoute,
    user
  } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  // If no specific roles required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = hasRole(...allowedRoles);

  // If user has required role, allow access
  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // Determine redirect path
  let targetPath = redirectPath || '/';
  if (redirectToRoleDefault && user) {
    targetPath = getDefaultRoute();
  }

  // Show access denied message before redirecting
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonAlert
          isOpen={true}
          header="Access Denied"
          message="You don't have permission to access this page."
          buttons={[
            {
              text: 'Go Back',
              handler: () => window.history.back()
            },
            {
              text: 'Go to Dashboard',
              handler: () => window.location.href = targetPath
            }
          ]}
          onDidDismiss={() => window.location.href = targetPath}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProtectedRoute;
