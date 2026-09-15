import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import ManagerDashboard from '../pages/ManagerDashboard';
import ManagerTraceability from '../pages/ManagerTraceability';
import ShopDashboard from '../pages/ShopDashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
import CustomerMarketplace from '../pages/CustomerMarketplace';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role ? user.role.toLowerCase() : '';
  if (role === 'manager' || role === 'admin') return <Navigate to="/manager" replace />;
  if (role === 'shop') return <Navigate to="/shop" replace />;
  return <Navigate to="/customer/marketplace" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Manager Routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/traceability"
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerTraceability />
          </ProtectedRoute>
        }
      />

      {/* Shop Routes */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['Shop']}>
            <ShopDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/customer/marketplace" element={<CustomerMarketplace />} />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
