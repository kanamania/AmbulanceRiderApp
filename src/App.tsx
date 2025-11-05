import { useEffect } from 'react';
import {Navigate, Route, Routes, BrowserRouter} from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import {personCircle, settingsSharp, homeSharp, statsChart} from 'ionicons/icons';
import Home from './pages/Home';
import Activity from './pages/Activity';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from "./pages/Settings";
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminRoutes from './routes/admin.routes';
import { notificationService } from './services';
import './i18n'; // Initialize i18n

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
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // Initialize push notifications on app start
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();
  }, []);

  return (
    <IonApp>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminRoutes />} />
              
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
                      <IonTabButton tab="profile" href="/tabs/profile">
                        <IonIcon aria-hidden="true" icon={personCircle} />
                        <IonLabel>Profile</IonLabel>
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
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
