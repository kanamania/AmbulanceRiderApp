import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROLES } from '../utils/role.utils';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import VehicleManagement from '../pages/admin/VehicleManagement';
import TripManagement from '../pages/admin/TripManagement';
import SystemSettings from '../pages/admin/SystemSettings';
import UserEdit from '../pages/admin/UserEdit';
import VehicleEdit from '../pages/admin/VehicleEdit';
import TripDetails from '../pages/admin/TripDetails';

const AdminRoutes: React.FC = () => {
  return (
    <IonRouterOutlet id="main-content">
      <Switch>
        {/* Dashboard */}
        <Route exact path="/admin/dashboard">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <Dashboard />
          </ProtectedRoute>
        </Route>

        {/* User Management */}
        <Route exact path="/admin/users">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        </Route>

        <Route exact path="/admin/users/new">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserEdit />
          </ProtectedRoute>
        </Route>

        <Route exact path="/admin/users/:id">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserEdit />
          </ProtectedRoute>
        </Route>

        {/* Vehicle Management */}
        <Route exact path="/admin/vehicles">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <VehicleManagement />
          </ProtectedRoute>
        </Route>

        <Route exact path="/admin/vehicles/new">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <VehicleEdit />
          </ProtectedRoute>
        </Route>

        <Route exact path="/admin/vehicles/:id">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <VehicleEdit />
          </ProtectedRoute>
        </Route>

        {/* Trip Management */}
        <Route exact path="/admin/trips">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <TripManagement />
          </ProtectedRoute>
        </Route>

        <Route exact path="/admin/trips/:id">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <TripDetails />
          </ProtectedRoute>
        </Route>

        {/* System Settings */}
        <Route exact path="/admin/settings">
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <SystemSettings />
          </ProtectedRoute>
        </Route>

        {/* Default admin route */}
        <Route exact path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>

        {/* 404 - Not Found */}
        <Route>
          <Redirect to="/admin/dashboard" />
        </Route>
      </Switch>
    </IonRouterOutlet>
  );
};

export default AdminRoutes;
