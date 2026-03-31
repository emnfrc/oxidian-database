import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Suspended() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-3">Compte suspendu</h1>
          <p className="text-gray-400 mb-6">
            Ton compte a été suspendu par un administrateur. Tu n’as plus accès à la plateforme.
          </p>
          <button
            onClick={onLogout}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7V6a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2h-7a2 2 0 01-2-2v-1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Suspended;
