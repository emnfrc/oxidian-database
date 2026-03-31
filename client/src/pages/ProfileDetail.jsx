import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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

  const canManageProfile = useMemo(() => {
    if (!user || !profile) {
      return false;
    }
    if (user.role === 'admin') {
      return true;
    }
    return Boolean(profile.created_by_username && profile.created_by_username === user.username);
  }, [user, profile]);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          notes: data.notes || ''
        });
      } else if (response.status === 404) {
        navigate('/profiles');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/profiles/${id}/images`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setGallery(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setProfile({
          ...profile,
          ...formData,
          updated_at: new Date().toISOString()
        });
        setEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Impossible de mettre à jour le profil');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Impossible de mettre à jour le profil');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce profil ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        navigate('/profiles');
      } else {
        const error = await response.json();
        alert(error.error || 'Impossible de supprimer le profil');
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Impossible de supprimer le profil');
    }
  };

  const handleExportJson = async () => {
    try {
      const response = await fetch(`/api/profiles/${id}/export`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Impossible d'exporter le profil");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profil-${id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert("Impossible d'exporter le profil");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append('photo', file);

      const response = await fetch(`/api/profiles/${id}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: form
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || 'Impossible de mettre à jour la photo');
        return;
      }

      setProfile((prev) => ({
        ...prev,
        profile_photo: data.profile_photo
      }));
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Impossible de mettre à jour la photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      return;
    }

    setUploadingImages(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append('images', file));

      const response = await fetch(`/api/profiles/${id}/images`, {
        method: 'POST',
        credentials: 'include',
        body: form
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "Impossible d'ajouter des images");
        return;
      }

      await fetchGallery();
    } catch (error) {
      console.error('Images upload failed:', error);
      alert("Impossible d'ajouter des images");
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Supprimer cette image ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${id}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "Impossible de supprimer l'image");
        return;
      }

      await fetchGallery();
    } catch (error) {
      console.error('Delete image failed:', error);
      alert("Impossible de supprimer l'image");
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
        <div className="text-gray-400">Chargement du profil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Profil introuvable</h3>
        <button onClick={() => navigate('/profiles')} className="btn-primary">
          Retour aux profils
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">{profile.name}</h1>
          <p className="text-gray-400">ID du profil : {profile.id}</p>
        </div>
        <div className="flex space-x-4">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                className="btn-primary"
              >
                Enregistrer
              </button>
            </>
          ) : (
            <>
              {canManageProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary"
                >
                  Modifier
                </button>
              )}
              {canManageProfile && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Informations du profil</h3>
            
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
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
                    className="input-field w-full h-32"
                  />
                </div>

              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Nom</p>
                    <p className="text-gray-100">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">E-mail</p>
                    <p className="text-gray-100">{profile.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Téléphone</p>
                    <p className="text-gray-100">{profile.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Localisation</p>
                    <p className="text-gray-100">{profile.location || 'Non renseignée'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-100 whitespace-pre-wrap">{profile.notes || 'Aucune note'}</p>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Auteur</h3>
            {profile.author ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700 flex items-center justify-center">
                  {profile.author.profilePhoto ? (
                    <img src={profile.author.profilePhoto} alt={profile.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Aucune</span>
                  )}
                </div>
                <div>
                  <div className="text-gray-100 font-medium">{profile.author.username}</div>
                  <div className="text-xs text-gray-400">Rang: {roleLabel(profile.author.role)}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Auteur inconnu</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Métadonnées</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Créé</p>
                <p className="text-gray-100">{new Date(profile.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Dernière modification</p>
                <p className="text-gray-100">{new Date(profile.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="btn-primary w-full" onClick={handleExportJson}>
                Télécharger JSON
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Photo de profil</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-tertiary border border-gray-700">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Aucune</div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="btn-secondary w-full inline-block text-center cursor-pointer">
                    {uploadingPhoto ? 'Envoi...' : 'Changer la photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Dossier images</h3>
            <div className="space-y-4">
              <label className="btn-secondary w-full inline-block text-center cursor-pointer">
                {uploadingImages ? 'Envoi...' : 'Ajouter des images'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImagesUpload}
                  disabled={uploadingImages}
                />
              </label>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.file_path}
                        alt={img.original_name || 'Image'}
                        className="w-full h-24 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucune image dans le dossier</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail;
