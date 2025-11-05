import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
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
import LocationManagement from '../pages/admin/LocationManagement';
import TripTypeManagement from '../pages/admin/TripTypeManagement';

const AdminRoutes: React.FC = () => {
  return (
    <IonRouterOutlet id="main-content">
      <Routes>
        {/* Dashboard */}
        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* User Management */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        } />

        <Route path="users/new" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserEdit />
          </ProtectedRoute>
        } />

        <Route path="users/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserEdit />
          </ProtectedRoute>
        } />

        {/* Vehicle Management */}
        <Route path="vehicles" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <VehicleManagement />
          </ProtectedRoute>
        } />

        <Route path="vehicles/new" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <VehicleEdit />
          </ProtectedRoute>
        } />

        <Route path="vehicles/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <VehicleEdit />
          </ProtectedRoute>
        } />

        {/* Trip Management */}
        <Route path="trips" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <TripManagement />
          </ProtectedRoute>
        } />

        <Route path="trips/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISPATCHER]}>
            <TripDetails />
          </ProtectedRoute>
        } />

        {/* Location Management */}
        <Route path="locations" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <LocationManagement />
          </ProtectedRoute>
        } />

        {/* Trip Type Management */}
        <Route path="trip-types" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <TripTypeManagement />
          </ProtectedRoute>
        } />

        {/* System Settings */}
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <SystemSettings />
          </ProtectedRoute>
        } />

        {/* Default admin route */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </IonRouterOutlet>
  );
};

export default AdminRoutes;
