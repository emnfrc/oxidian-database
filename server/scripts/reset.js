const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'osint_dashboard.db');
const uploadsRoot = path.join(root, 'uploads');
const configPath = path.join(root, 'config.json');

function rmDirIfExists(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
}

function rmFileIfExists(file) {
  try {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  } catch {
    // ignore
  }
}

// 1) Delete SQLite DB file
rmFileIfExists(dbPath);

// 2) Delete heavy upload folders (keep root assets like /uploads/pdp.jpg)
rmDirIfExists(path.join(uploadsRoot, 'profiles'));
rmDirIfExists(path.join(uploadsRoot, 'users'));

// 3) Reset config.json to a single admin user
const adminPasswordHash = '$2b$10$/DfobdtwOD4Vfa6Vx2eK0O3kj0/SD9v5MbDNlkZ7aDuQQYcgch3fK';

const nextConfig = {
  user: {
    username: 'admin',
    password: adminPasswordHash
  },
  session: {
    secret: 'osint-dashboard-secret-key-change-in-production',
    maxAge: 3600000
  },
  users: [
    {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      suspended: false,
      profilePhoto: '/uploads/pdp.jpg'
    }
  ]
};

try {
  fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2));
} catch {
  // ignore
}

console.log('Reset terminé.');
console.log('Identifiants: admin / password123');
console.log('DB supprimée:', dbPath);
console.log('Uploads supprimés:', path.join(uploadsRoot, 'profiles'), 'et', path.join(uploadsRoot, 'users'));
