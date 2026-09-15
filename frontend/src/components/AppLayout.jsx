import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role ? user.role.toLowerCase() : '';
  const isDashboardRole = isAuthenticated && (role === 'manager' || role === 'admin' || role === 'shop');

  if (isDashboardRole) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Navbar />
          <main style={{ flex: 1, padding: '1.75rem 2rem' }}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
