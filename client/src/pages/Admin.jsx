import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('standard');
  const [saving, setSaving] = useState(false);

  const [expandedUser, setExpandedUser] = useState(null);
  const [profilesByUser, setProfilesByUser] = useState({});
  const [profilesLoadingByUser, setProfilesLoadingByUser] = useState({});
  const [renameByUser, setRenameByUser] = useState({});

  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'premium') return 'Premium';
    return 'Utilisateur';
  };

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    if (user?.suspended) {
      navigate('/suspended');
    }
  }, [user, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'SUSPENDED') {
          navigate('/suspended');
          return;
        }
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de charger les utilisateurs');
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, isAdmin, fetchUsers, navigate]);

  const createUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: createUsername, password: createPassword, role: createRole })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de créer l\'utilisateur');
        return;
      }

      setCreateUsername('');
      setCreatePassword('');
      setCreateRole('standard');
      await fetchUsers();
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const renameUser = async (username, newUsername) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ newUsername })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de renommer');
        return;
      }
      setExpandedUser((prev) => (prev === username ? data.user.username : prev));
      setRenameByUser((prev) => {
        const next = { ...prev };
        delete next[username];
        return next;
      });
      await fetchUsers();
    } catch (e) {
      setError('Erreur réseau');
    }
  };

  const fetchProfilesForUser = async (username) => {
    setProfilesLoadingByUser((prev) => ({ ...prev, [username]: true }));
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/profiles`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de charger les fiches');
        return;
      }
      setProfilesByUser((prev) => ({ ...prev, [username]: Array.isArray(data.profiles) ? data.profiles : [] }));
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setProfilesLoadingByUser((prev) => ({ ...prev, [username]: false }));
    }
  };

  const setRole = async (username, role) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de modifier le rôle');
        return;
      }
      await fetchUsers();
    } catch (e) {
      setError('Erreur réseau');
    }
  };

  const setSuspended = async (username, suspended) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ suspended })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de modifier la suspension');
        return;
      }
      await fetchUsers();
    } catch (e) {
      setError('Erreur réseau');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Administration</h1>
        <p className="text-gray-400">Gestion des membres</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Membres</h3>

            {loading ? (
              <div className="text-gray-400">Chargement...</div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => {
                  const isExpanded = expandedUser === u.username;
                  const renameValue = renameByUser[u.username] ?? '';
                  const userProfiles = profilesByUser[u.username];
                  const profilesLoading = Boolean(profilesLoadingByUser[u.username]);

                  return (
                    <div key={u.username} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        onClick={() => {
                          setExpandedUser((prev) => (prev === u.username ? null : u.username));
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                            {u.profilePhoto ? (
                              <img src={u.profilePhoto} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-500">Aucune</span>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="text-gray-100 font-medium">{u.username}</div>
                            <div className="text-xs text-gray-400">Rôle: {roleLabel(u.role)}{u.suspended ? ' • Suspendu' : ''}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/users/${encodeURIComponent(u.username)}`}
                            className="btn-secondary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Détails
                          </Link>
                          <span className="text-xs text-gray-500">{isExpanded ? 'Fermer' : 'Gérer'}</span>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-white/5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-2">Rôle</label>
                              <select
                                className="input-field w-full"
                                value={u.role}
                                onChange={(e) => setRole(u.username, e.target.value)}
                              >
                                <option value="standard">Utilisateur</option>
                                <option value="premium">Premium</option>
                                <option value="admin">Administrateur</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-400 mb-2">Suspension</label>
                              <button
                                type="button"
                                className={u.suspended ? 'btn-secondary w-full' : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full'}
                                onClick={() => setSuspended(u.username, !u.suspended)}
                              >
                                {u.suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-400 mb-2">Renommer</label>
                              <input
                                className="input-field w-full"
                                placeholder="Nouveau nom d'utilisateur"
                                value={renameValue}
                                onChange={(e) => setRenameByUser((prev) => ({ ...prev, [u.username]: e.target.value }))}
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                className="btn-primary w-full"
                                onClick={() => renameUser(u.username, renameValue.trim())}
                                disabled={!renameValue.trim()}
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-200">Fiches créées</div>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => fetchProfilesForUser(u.username)}
                                disabled={profilesLoading}
                              >
                                {profilesLoading ? 'Chargement...' : 'Rafraîchir'}
                              </button>
                            </div>

                            {!userProfiles ? (
                              <button type="button" className="btn-secondary w-full" onClick={() => fetchProfilesForUser(u.username)}>
                                Voir les fiches
                              </button>
                            ) : (
                              <div className="space-y-2">
                                {userProfiles.length === 0 ? (
                                  <div className="text-sm text-gray-500">Aucune fiche</div>
                                ) : (
                                  userProfiles.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg p-3">
                                      <div className="min-w-0">
                                        <div className="text-sm text-gray-200 truncate">{p.name}</div>
                                        <div className="text-xs text-gray-500">ID: {p.id}</div>
                                      </div>
                                      <Link to={`/profiles/${p.id}`} className="btn-secondary">
                                        Ouvrir
                                      </Link>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {users.length === 0 && (
                  <div className="text-gray-400">Aucun utilisateur</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Créer un utilisateur</h3>
            <form onSubmit={createUser} className="space-y-3">
              <input
                className="input-field w-full"
                placeholder="Nom d'utilisateur"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                required
                disabled={saving}
              />
              <input
                className="input-field w-full"
                placeholder="Mot de passe"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                minLength={6}
                disabled={saving}
              />
              <select
                className="input-field w-full"
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                disabled={saving}
              >
                <option value="standard">Utilisateur</option>
                <option value="premium">Premium</option>
                <option value="admin">Administrateur</option>
              </select>
              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Session</h3>
            <button onClick={logout} className="btn-secondary w-full">
              Se déconnecter
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Développé par Emanuel F.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
