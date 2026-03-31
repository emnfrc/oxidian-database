import React, { useState } from 'react';

function Tools() {
  const [usernameSearch, setUsernameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUsernameSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock search results
    setTimeout(() => {
      setSearchResults({
        type: 'username',
        query: usernameSearch,
        platforms: [
          { platform: 'Twitter', found: true, url: `https://twitter.com/${usernameSearch}` },
          { platform: 'GitHub', found: true, url: `https://github.com/${usernameSearch}` },
          { platform: 'LinkedIn', found: false, url: null },
          { platform: 'Instagram', found: true, url: `https://instagram.com/${usernameSearch}` },
          { platform: 'Reddit', found: false, url: null }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const handleEmailSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock email search results
    setTimeout(() => {
      setSearchResults({
        type: 'email',
        query: emailSearch,
        breaches: [
          { service: 'LinkedIn', date: '2021-06-01', severity: 'Medium' },
          { service: 'Adobe', date: '2013-10-04', severity: 'High' }
        ],
        domains: ['gmail.com', 'outlook.com']
      });
      setLoading(false);
    }, 1500);
  };

  const handleIpLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock IP lookup results
    setTimeout(() => {
      setSearchResults({
        type: 'ip',
        query: ipAddress,
        location: 'New York, États-Unis',
        isp: 'Cloudflare Inc.',
        timezone: 'America/New_York',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      });
      setLoading(false);
    }, 1500);
  };

  const clearResults = () => {
    setSearchResults(null);
    setUsernameSearch('');
    setEmailSearch('');
    setIpAddress('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Outils OSINT</h1>
        <p className="text-gray-400">Collecte des informations via différentes techniques OSINT</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Username Search Tool */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Recherche de nom d'utilisateur</h3>
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <form onSubmit={handleUsernameSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                placeholder="Saisis un nom d'utilisateur"
                className="input-field w-full"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Recherche...' : "Rechercher"}
            </button>
          </form>
        </div>

        {/* Email Lookup Tool */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Recherche e-mail</h3>
            <div className="bg-green-500/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <form onSubmit={handleEmailSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Saisis une adresse e-mail"
                className="input-field w-full"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* IP Address Lookup */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Analyse d'adresse IP</h3>
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          
          <form onSubmit={handleIpLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse IP
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Saisis une IP (ex: 8.8.8.8)"
                className="input-field w-full"
                pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Analyse...' : 'Analyser'}
            </button>
          </form>
        </div>

        {/* Domain Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Informations de domaine</h3>
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
          
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-400 mb-4">Outil de recherche de domaine bientôt disponible</p>
            <button className="btn-secondary" disabled>
              Bientôt
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Résultats</h3>
            <button onClick={clearResults} className="btn-secondary">
              Effacer
            </button>
          </div>
          
          <div className="card">
            <div className="mb-4">
              <p className="text-sm text-gray-400">Requête :</p>
              <p className="text-gray-100 font-mono">{searchResults.query}</p>
            </div>

            {searchResults.type === 'username' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Plateformes</h4>
                <div className="space-y-2">
                  {searchResults.platforms.map((platform, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-dark-tertiary rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${platform.found ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-gray-100">{platform.platform}</span>
                      </div>
                      {platform.found ? (
                        <a 
                          href={platform.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-dark-accent hover:text-dark-accentHover"
                        >
                          Voir
                        </a>
                      ) : (
                        <span className="text-gray-500">Introuvable</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.type === 'email' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Fuites de données (mock)</h4>
                <div className="space-y-2">
                  {searchResults.breaches.map((breach, index) => (
                    <div key={index} className="p-3 bg-dark-tertiary rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-100">{breach.service}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          breach.severity === 'High' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {breach.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Date : {breach.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.type === 'ip' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Informations IP (mock)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Localisation</p>
                    <p className="text-gray-100">{searchResults.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">ISP</p>
                    <p className="text-gray-100">{searchResults.isp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Fuseau horaire</p>
                    <p className="text-gray-100">{searchResults.timezone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Coordonnées</p>
                    <p className="text-gray-100">{searchResults.coordinates.lat}, {searchResults.coordinates.lng}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tools;
