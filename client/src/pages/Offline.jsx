import React, { useEffect, useState } from 'react';

function Offline() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPulse((p) => !p);
    }, 1200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="card text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-green-500/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 w-[420px] h-[420px] rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
                <img src="/uploads/obsidian-database-logo.png" alt="Oxidian Database" className="h-14 w-auto" />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${pulse ? 'bg-green-400' : 'bg-green-400/40'} transition-colors`} />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400/20 animate-ping" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Site hors ligne</h1>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Ta connexion semble indisponible. Vérifie ton réseau puis réessaie.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  try {
                    window.open('ms-settings:network', '_blank');
                  } catch {
                    // ignore
                  }
                }}
              >
                Ouvrir les paramètres réseau
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Oxidian Database
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Offline;
