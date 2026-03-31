import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    notes: ''
  });

  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'premium') return 'Premium';
    return 'Utilisateur';
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles', {
        credentials: 'include'
      });
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await fetch('/api/profiles/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profile: parsed }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || 'Import impossible');
        return;
      }

      await fetchProfiles();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import impossible');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          notes: '',
          social_links: {
            github: '',
            twitter: '',
            linkedin: '',
            instagram: ''
          }
        });
        fetchProfiles();
      } else {
        const error = await response.json();
        alert(error.error || 'Impossible de créer le profil');
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Impossible de créer le profil');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Chargement des profils...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Profils</h1>
          <p className="text-gray-400">Gère ta base de profils</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="btn-secondary cursor-pointer">
            {importing ? 'Import...' : 'Importer JSON'}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportJson}
              disabled={importing}
            />
          </label>

          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Ajouter</span>
            </div>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Ajouter un nouveau profil</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Localisation</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-field w-full h-24"
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                Créer le profil
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Link key={profile.id} to={`/profiles/${profile.id}`} className="block">
            <div className="card hover:border-dark-accent transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-accent/20 border border-gray-700 flex items-center justify-center">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-400">ID: {profile.id}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{profile.name}</h3>
              
              <div className="space-y-1 text-sm text-gray-400">
                {profile.email && <p>📧 {profile.email}</p>}
                {profile.phone && <p>📱 {profile.phone}</p>}
                {profile.location && <p>📍 {profile.location}</p>}
              </div>

              {profile.notes && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400 line-clamp-2">{profile.notes}</p>
                </div>
              )}

              {profile.author && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Auteur</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                      {profile.author.profilePhoto ? (
                        <img
                          src={profile.author.profilePhoto}
                          alt={profile.author.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-500">Aucune</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-200 truncate">{profile.author.username}</div>
                      <div className="text-xs text-gray-500 truncate">{roleLabel(profile.author.role)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Créé : {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Aucun profil pour le moment</h3>
          <p className="text-gray-400 mb-6">Commence par ajouter ton premier profil</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Ajouter un profil
          </button>
        </div>
      )}
    </div>
  );
}

export default Profiles;
