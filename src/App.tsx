import React, { Suspense, lazy } from 'react';
import {Navigate, Route, Routes, BrowserRouter} from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonSpinner,
  setupIonicReact
} from '@ionic/react';
import {settingsSharp, homeSharp, statsChart} from 'ionicons/icons';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SyncProvider } from './contexts/SyncContext';
import { OfflineProvider } from './contexts/OfflineContext';
import './i18n';

const Home = lazy(() => import('./pages/Home'));
const Activity = lazy(() => import('./pages/Activity'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Settings = lazy(() => import('./pages/Settings'));
const NotificationsHistory = lazy(() => import('./pages/NotificationsHistory'));
const AdminRoutes = lazy(() => import('./routes/admin.routes'));

const PageLoader: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <IonSpinner name="crescent" />
  </div>
);

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // Note: Real-time notifications are handled via SignalR in the backend
  // No need for push notifications plugin (Firebase/APNs)
  
  return (
    <IonApp>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <OfflineProvider>
              <SyncProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin/*" element={<AdminRoutes />} />
                      
                      {/* Notifications History Route */}
                      <Route path="/notifications-history" element={
                        <ProtectedRoute>
                          <NotificationsHistory />
                        </ProtectedRoute>
                      } />
                      
                      {/* Protected Routes with Tabs */}
                      <Route path="/tabs/*" element={
                        <ProtectedRoute>
                          <IonTabs>
                            <IonRouterOutlet>
                              <Routes>
                                <Route path="home" element={<Home />} />
                                <Route path="activity" element={<Activity />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="profile" element={<Profile />} />
                                <Route index element={<Navigate to="/tabs/home" replace />} />
                              </Routes>
                            </IonRouterOutlet>
                            <IonTabBar slot="bottom">
                              <IonTabButton tab="home" href="/tabs/home">
                                <IonIcon aria-hidden="true" icon={homeSharp} />
                                <IonLabel>Home</IonLabel>
                              </IonTabButton>
                              <IonTabButton tab="activity" href="/tabs/activity">
                                <IonIcon aria-hidden="true" icon={statsChart} />
                                <IonLabel>Activity</IonLabel>
                              </IonTabButton>
                              <IonTabButton tab="settings" href="/tabs/settings">
                                <IonIcon aria-hidden="true" icon={settingsSharp} />
                                <IonLabel>Settings</IonLabel>
                              </IonTabButton>
                            </IonTabBar>
                          </IonTabs>
                        </ProtectedRoute>
                      } />
                      
                      {/* Default Redirect */}
                      <Route path="/" element={<Navigate to="/tabs/home" replace />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </SyncProvider>
            </OfflineProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </IonApp>
  );
};

export default App;
