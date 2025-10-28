import { Redirect, Route } from 'react-router-dom';
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
import { IonReactRouter } from '@ionic/react-router';
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

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <AuthProvider>
        <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes */}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/reset-password" component={ResetPassword} />
          
          {/* Admin Routes */}
          <Route path="/admin">
            <AdminRoutes />
          </Route>
          
          {/* Protected Routes with Tabs */}
          <Route path="/tabs">
            <ProtectedRoute>
              <IonTabs>
                <IonRouterOutlet>
                  <Route exact path="/tabs/home">
                    <Home />
                  </Route>
                  <Route exact path="/tabs/activity">
                    <Activity />
                  </Route>
                  <Route exact path="/tabs/settings">
                    <Settings />
                  </Route>
                  <Route exact path="/tabs/profile">
                    <Profile />
                  </Route>
                  <Route exact path="/tabs">
                    <Redirect to="/tabs/home" />
                  </Route>
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
          </Route>
          
          {/* Profile Route (Protected, outside tabs) */}
          <Route exact path="/tabs/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          
          {/* Default Redirect */}
          <Route exact path="/">
            <Redirect to="/tabs/home" />
          </Route>
        </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
