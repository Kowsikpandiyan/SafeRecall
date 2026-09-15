import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
            <main style={{ flex: 1 }}>
              <AppRoutes />
            </main>
            <footer style={{
              borderTop: '1px solid var(--border-color)',
              padding: '1.25rem 1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-canvas)'
            }}>
              SupplyTrace Enterprise Supply Chain & Recall Platform &copy; 2026. Powered by React, Node.js & MongoDB.
            </footer>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
