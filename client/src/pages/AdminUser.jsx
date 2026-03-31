import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminUser() {
  const { user: me } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  const isAdmin = useMemo(() => me?.role === 'admin', [me]);

  const [u, setU] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [error, setError] = useState('');

  const [renameValue, setRenameValue] = useState('');
  const [saving, setSaving] = useState(false);

  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'premium') return 'Premium';
    return 'Utilisateur';
  };

  const deleteUserAccount = async () => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}` , {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Impossible de supprimer l'utilisateur");
        return;
      }
      navigate('/admin');
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (me?.suspended) {
      navigate('/suspended');
    }
  }, [me, navigate]);

  useEffect(() => {
    if (!me) return;
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUser();
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, isAdmin, username]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de charger l\'utilisateur');
        return;
      }
      setU(data.user);
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchProfiles = useCallback(async () => {
    setProfilesLoading(true);
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
      setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setProfilesLoading(false);
    }
  }, [username]);

  const setRole = async (role) => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de modifier le rôle');
        return;
      }
      setU(data.user);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const setSuspended = async (suspended) => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ suspended })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de modifier la suspension');
        return;
      }
      setU(data.user);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const renameUser = async () => {
    const newUsername = renameValue.trim();
    if (!newUsername) return;

    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newUsername })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de renommer');
        return;
      }

      setRenameValue('');
      navigate(`/admin/users/${encodeURIComponent(data.user.username)}`, { replace: true });
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async (profileId) => {
    if (!confirm('Supprimer cette fiche ?')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Impossible de supprimer la fiche');
        return;
      }
      await fetchProfiles();
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Membre</h1>
          <p className="text-gray-400">Gestion du compte</p>
        </div>
        <Link to="/admin" className="btn-secondary">Retour</Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Chargement...</div>
      ) : !u ? (
        <div className="text-gray-400">Utilisateur introuvable</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                  {u.profilePhoto ? (
                    <img src={u.profilePhoto} alt={u.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Aucune</span>
                  )}
                </div>
                <div>
                  <div className="text-gray-100 font-semibold">{u.username}</div>
                  <div className="text-sm text-gray-400">Rôle: {roleLabel(u.role)}{u.suspended ? ' • Suspendu' : ''}</div>
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Rôle</label>
                <select className="input-field w-full" value={u.role} onChange={(e) => setRole(e.target.value)} disabled={saving}>
                  <option value="standard">Utilisateur</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Renommer</label>
                <div className="flex space-x-2">
                  <input
                    className="input-field w-full"
                    placeholder="Nouveau nom d'utilisateur"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    disabled={saving}
                  />
                  <button type="button" className="btn-primary" onClick={renameUser} disabled={saving || !renameValue.trim()}>
                    OK
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Suspension</label>
                <button
                  type="button"
                  className={u.suspended ? 'btn-secondary w-full' : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full'}
                  onClick={() => setSuspended(!u.suspended)}
                  disabled={saving}
                >
                  {u.suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Danger</label>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
                  onClick={deleteUserAccount}
                  disabled={saving}
                >
                  Supprimer l’utilisateur
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-100">Fiches créées</h3>
                <button type="button" className="btn-secondary" onClick={fetchProfiles} disabled={profilesLoading || saving}>
                  {profilesLoading ? 'Chargement...' : 'Rafraîchir'}
                </button>
              </div>

              {profilesLoading ? (
                <div className="text-gray-400">Chargement...</div>
              ) : profiles.length === 0 ? (
                <div className="text-gray-500">Aucune fiche</div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="text-gray-200 font-medium truncate">{p.name}</div>
                        <div className="text-xs text-gray-500">ID: {p.id}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link to={`/profiles/${p.id}`} className="btn-secondary">Ouvrir</Link>
                        <button
                          type="button"
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          onClick={() => deleteProfile(p.id)}
                          disabled={saving}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUser;
