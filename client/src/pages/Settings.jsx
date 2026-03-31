import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { user, updateUser } = useAuth();
  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'premium') return 'Premium';
    return 'Utilisateur';
  };
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType(null);
    setLoading(true);

    if (newPassword.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Les nouveaux mots de passe ne correspondent pas');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe mis à jour avec succès !');
        setMessageType('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.error || 'Impossible de mettre à jour le mot de passe');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      setMessage('Erreur réseau. Réessaie.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setPhotoError('');
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const response = await fetch('/api/me/photo', {
        method: 'POST',
        credentials: 'include',
        body: form
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPhotoError(data.error || 'Impossible de mettre à jour la photo');
        return;
      }

      if (data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error('User photo upload failed:', error);
      setPhotoError('Erreur réseau. Réessaie.');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleCheckUpdates = () => {
    window.dispatchEvent(
      new CustomEvent('oxidian:toast', {
        detail: {
          type: 'success',
          message: "Ton application est à jour.",
          durationMs: 5000
        }
      })
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Paramètres</h1>
        <p className="text-gray-400">Gère ton compte et tes préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Profil</h3>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">Aucune</span>
                )}
              </div>

              <div className="flex-1">
                <div className="text-gray-100 font-medium">{user?.username}</div>
                <div className="text-sm text-gray-400">Rang: {roleLabel(user?.role)}</div>

                <div className="mt-3">
                  <label className="btn-secondary inline-block text-center cursor-pointer">
                    {photoUploading ? 'Envoi...' : 'Changer la photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUserPhotoUpload}
                      disabled={photoUploading}
                    />
                  </label>
                </div>

                {photoError && (
                  <div className="mt-3 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                    {photoError}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Changer le mot de passe</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full"
                  required
                  minLength="6"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">Au moins 6 caractères</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field w-full"
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    messageType === 'success'
                      ? 'bg-green-900/50 border border-green-600 text-green-200'
                      : 'bg-red-900/50 border border-red-600 text-red-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          </div>

          <div className="card mt-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Paramètres de l'application</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-100">Thème sombre</p>
                  <p className="text-sm text-gray-400">Le thème sombre est activé</p>
                </div>
                <button className="bg-dark-accent text-white px-4 py-2 rounded-lg" disabled>
                  Activé
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-100">Expiration de session</p>
                  <p className="text-sm text-gray-400">Déconnexion automatique après 1h d'inactivité</p>
                </div>
                <button className="btn-secondary" disabled>
                  1 heure
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-100">Export des données</p>
                  <p className="text-sm text-gray-400">Exporter toutes les données de profils</p>
                </div>
                <button className="btn-secondary">
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Informations système</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Version</p>
                <p className="text-gray-100">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Base de données</p>
                <p className="text-gray-100">SQLite</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Backend</p>
                <p className="text-gray-100">Node.js + Express</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Frontend</p>
                <p className="text-gray-100">React + Vite</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Support</h3>
            <div className="space-y-3">
              <button className="btn-secondary w-full">
                Voir la documentation
              </button>
              <button className="btn-secondary w-full">
                Signaler un problème
              </button>
              <button className="btn-secondary w-full" onClick={handleCheckUpdates}>
                Vérifier les mises à jour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
