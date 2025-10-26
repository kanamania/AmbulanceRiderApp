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
import { ellipse, square, triangle, personCircle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

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
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes */}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/reset-password" component={ResetPassword} />
          
          {/* Protected Routes with Tabs */}
          <Route path="/tabs">
            <ProtectedRoute>
              <IonTabs>
                <IonRouterOutlet>
                  <Route exact path="/tabs/tab1">
                    <Tab1 />
                  </Route>
                  <Route exact path="/tabs/tab2">
                    <Tab2 />
                  </Route>
                  <Route exact path="/tabs/tab3">
                    <Tab3 />
                  </Route>
                  <Route exact path="/tabs">
                    <Redirect to="/tabs/tab1" />
                  </Route>
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                  <IonTabButton tab="tab1" href="/tabs/tab1">
                    <IonIcon aria-hidden="true" icon={triangle} />
                    <IonLabel>Home</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="tab2" href="/tabs/tab2">
                    <IonIcon aria-hidden="true" icon={ellipse} />
                    <IonLabel>Services</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="tab3" href="/tabs/tab3">
                    <IonIcon aria-hidden="true" icon={square} />
                    <IonLabel>History</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="profile" href="/profile">
                    <IonIcon aria-hidden="true" icon={personCircle} />
                    <IonLabel>Profile</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </ProtectedRoute>
          </Route>
          
          {/* Profile Route (Protected, outside tabs) */}
          <Route exact path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          
          {/* Default Redirect */}
          <Route exact path="/">
            <Redirect to="/tabs/tab1" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
