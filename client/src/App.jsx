import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ProfileDetail from './pages/ProfileDetail';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminUser from './pages/AdminUser';
import Suspended from './pages/Suspended';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }
  if (user?.suspended) {
    return <Navigate to="/suspended" replace />;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/suspended" element={<Suspended />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="profiles/:id" element={<ProfileDetail />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/users/:username" element={<AdminUser />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
