import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [toastNow, setToastNow] = useState(Date.now());
  const toastIntervalRef = useRef(null);

  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'premium') return 'Premium';
    return 'Utilisateur';
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    const onToast = (e) => {
      const detail = e?.detail || {};
      const durationMs = typeof detail.durationMs === 'number' ? detail.durationMs : 5000;
      const nextToast = {
        id: `${Date.now()}-${Math.random()}`,
        message: detail.message || 'À jour',
        type: detail.type || 'success',
        durationMs,
        startAt: Date.now()
      };

      setToast(nextToast);
      setToastNow(Date.now());

      if (toastIntervalRef.current) {
        window.clearInterval(toastIntervalRef.current);
      }

      toastIntervalRef.current = window.setInterval(() => {
        setToastNow(Date.now());
      }, 50);

      window.setTimeout(() => {
        setToast((current) => (current?.id === nextToast.id ? null : current));
        if (toastIntervalRef.current) {
          window.clearInterval(toastIntervalRef.current);
          toastIntervalRef.current = null;
        }
      }, durationMs);
    };

    window.addEventListener('oxidian:toast', onToast);
    return () => {
      window.removeEventListener('oxidian:toast', onToast);
      if (toastIntervalRef.current) {
        window.clearInterval(toastIntervalRef.current);
        toastIntervalRef.current = null;
      }
    };
  }, []);

  const toastProgress = (() => {
    if (!toast) return 0;
    const elapsed = Math.max(0, toastNow - toast.startAt);
    const remaining = Math.max(0, toast.durationMs - elapsed);
    return toast.durationMs ? remaining / toast.durationMs : 0;
  })();

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-dark-secondary min-h-screen border-r border-gray-700">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-start pl-2">
                <img
                  src="/uploads/obsidian-database-logo.png"
                  alt="Oxidian Database"
                  className="h-16 w-auto"
                />
              </div>
            </div>
            
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Tableau de bord</span>
                </div>
              </Link>
              
              <Link
                to="/profiles"
                className={`sidebar-item ${isActive('/profiles') ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Profils</span>
                </div>
              </Link>
              
              <Link
                to="/settings"
                className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Paramètres</span>
                </div>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 19c0-2.761 2.686-5 6-5s6 2.239 6 5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4M4 8h4" />
                    </svg>
                    <span>Admin</span>
                  </div>
                </Link>
              )}
            </nav>

            <div className="mt-8 text-xs text-gray-500 px-2">
              Développé par Emanuel F.
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {toast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[min(560px,calc(100vw-2rem))]">
              <div className="bg-green-900/40 border border-green-600 text-green-100 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <div className="flex items-start space-x-3 px-4 py-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{toast.message}</div>
                    <div className="text-xs text-green-200/80">À jour</div>
                  </div>
                </div>
                <div className="h-1 bg-black/20">
                  <div className="h-full bg-green-400/80" style={{ width: `${Math.round(toastProgress * 100)}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Top Bar */}
          <div className="bg-dark-secondary border-b border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">
                {location.pathname === '/dashboard' && 'Tableau de bord'}
                {location.pathname === '/profiles' && 'Profils'}
                {location.pathname.startsWith('/profiles/') && 'Détails du profil'}
                {location.pathname === '/admin' && 'Administration'}
                {location.pathname === '/settings' && 'Paramètres'}
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl border border-white/10 bg-black/20">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-500">Aucune</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-gray-200">{user?.username}</div>
                    {user?.role && (
                      <div className="text-[11px] text-gray-400">{roleLabel(user.role)}</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="btn-secondary text-sm px-3"
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7V6a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2h-7a2 2 0 01-2-2v-1" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
