const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database');
const {
  authenticateUser,
  updatePassword,
  setUserPassword,
  upsertUser,
  setUserSuspended,
  setUserRole,
  setUserProfilePhoto,
  renameUser,
  deleteUser,
  listUsers,
  getUser,
  getConfig
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsRoot = path.join(__dirname, 'uploads');
const ensureDir = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch {
    // ignore
  }
};
ensureDir(uploadsRoot);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsRoot));

// Session middleware
const config = getConfig();
app.use(session({
  secret: config.session?.secret || 'osint-dashboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: config.session?.maxAge || 3600000 // 1 hour
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    const user = getUser(req.session.username);
    if (!user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    if (user.suspended) {
      return res.status(403).json({ error: 'Compte suspendu', code: 'SUSPENDED' });
    }
    req.user = user;
    next();
  } else {
    res.status(401).json({ error: 'Authentification requise' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function requireProfileManagePermission(req, res, profileId, cb) {
  db.get('SELECT created_by_username FROM profiles WHERE id = ?', [profileId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const isOwner = row.created_by_username && row.created_by_username === req.user.username;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    cb();
  });
}

function profileUploadsDir(profileId) {
  const dir = path.join(uploadsRoot, 'profiles', String(profileId));
  ensureDir(dir);
  return dir;
}

function userUploadsDir(username) {
  const dir = path.join(uploadsRoot, 'users', String(username));
  ensureDir(dir);
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    if (req.user?.username && req.originalUrl?.startsWith('/api/me/photo')) {
      const dir = userUploadsDir(req.user.username);
      return cb(null, dir);
    }
    const dir = profileUploadsDir(id || 'temp');
    return cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Routes

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const result = authenticateUser(username, password);
  if (!result.ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  if (result.user?.suspended) {
    return res.status(403).json({ error: 'Compte suspendu', code: 'SUSPENDED' });
  }

  req.session.authenticated = true;
  req.session.username = username;
  res.json({ success: true, message: 'Login successful', user: result.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.authenticated) {
    const user = getUser(req.session.username);
    if (!user) {
      return res.json({ authenticated: false });
    }
    if (user.suspended) {
      return res.json({ authenticated: true, username: user.username, suspended: true });
    }
    res.json({ authenticated: true, username: user.username, user });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// User profile photo
app.post('/api/me/photo', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relativePath = `/uploads/users/${req.user.username}/${req.file.filename}`;
  const update = setUserProfilePhoto(req.user.username, relativePath);
  if (!update.ok) {
    return res.status(500).json({ error: update.error || 'Failed to update profile photo' });
  }
  res.json({ success: true, user: update.user });
});

// Admin
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json({ users: listUsers() });
});

app.get('/api/admin/users/:username', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;
  const u = getUser(username);
  if (!u) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user: u });
});

app.delete('/api/admin/users/:username', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;

  const result = deleteUser(username);
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Failed to delete user' });
  }

  // Delete all profiles created by this user (and their files)
  db.all('SELECT id FROM profiles WHERE created_by_username = ?', [username], (listErr, rows) => {
    if (listErr) {
      return res.status(500).json({ error: listErr.message });
    }

    const profileIds = (rows || []).map((r) => r.id);

    db.run('DELETE FROM profiles WHERE created_by_username = ?', [username], (delErr) => {
      if (delErr) {
        return res.status(500).json({ error: delErr.message });
      }

      // Best-effort remove profile uploads
      try {
        profileIds.forEach((id) => {
          const dir = path.join(uploadsRoot, 'profiles', String(id));
          if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
          }
        });
      } catch {
        // ignore
      }

      // Best-effort remove user uploads
      try {
        const dir = path.join(uploadsRoot, 'users', String(username));
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        // ignore
      }

      // If admin deleted the currently logged-in account, terminate session
      if (req.session?.username === username) {
        try {
          req.session.destroy(() => {
            res.json({ success: true });
          });
          return;
        } catch {
          // ignore
        }
      }

      res.json({ success: true });
    });
  });
});

app.post('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  const result = upsertUser({ username, password, role: role || 'standard', suspended: false, profilePhoto: '/uploads/pdp.jpg' });
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Failed to create user' });
  }
  res.json({ success: true, user: result.user });
});

app.patch('/api/admin/users/:username/role', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  const result = setUserRole(username, role);
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Failed to update role' });
  }
  res.json({ success: true, user: result.user });
});

app.patch('/api/admin/users/:username/suspend', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { suspended } = req.body;
  const result = setUserSuspended(username, Boolean(suspended));
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Failed to update suspension' });
  }
  res.json({ success: true, user: result.user });
});

app.patch('/api/admin/users/:username/rename', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { newUsername } = req.body;
  if (!newUsername) {
    return res.status(400).json({ error: 'newUsername is required' });
  }

  const before = getUser(username);
  const beforePhoto = before?.profilePhoto || null;

  const result = renameUser(username, newUsername);
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Failed to rename user' });
  }

  // Best-effort move uploads folder to keep profile photo working
  try {
    const oldDir = path.join(uploadsRoot, 'users', String(username));
    const nextDir = path.join(uploadsRoot, 'users', String(newUsername));
    if (fs.existsSync(oldDir) && !fs.existsSync(nextDir)) {
      fs.renameSync(oldDir, nextDir);
    }

    if (beforePhoto && beforePhoto.includes(`/uploads/users/${username}/`)) {
      const nextPhoto = beforePhoto.replace(`/uploads/users/${username}/`, `/uploads/users/${newUsername}/`);
      setUserProfilePhoto(newUsername, nextPhoto);
      result.user.profilePhoto = nextPhoto;
    } else if (beforePhoto) {
      setUserProfilePhoto(newUsername, beforePhoto);
      result.user.profilePhoto = beforePhoto;
    }
  } catch {
    // If anything fails, preserve existing path so it doesn't break.
    if (beforePhoto) {
      setUserProfilePhoto(newUsername, beforePhoto);
      result.user.profilePhoto = beforePhoto;
    }
  }

  db.run(
    'UPDATE profiles SET created_by_username = ? WHERE created_by_username = ?',
    [newUsername, username],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (req.session?.username === username) {
        req.session.username = newUsername;
      }

      res.json({ success: true, user: result.user });
    }
  );
});

app.get('/api/admin/users/:username/profiles', requireAuth, requireAdmin, (req, res) => {
  const { username } = req.params;
  db.all(
    'SELECT id, name, created_at, updated_at FROM profiles WHERE created_by_username = ? ORDER BY created_at DESC',
    [username],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, profiles: rows || [] });
    }
  );
});

// Profile routes
app.get('/api/profiles', requireAuth, (req, res) => {
  const sql = 'SELECT * FROM profiles ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const profiles = rows.map(row => {
      const author = row.created_by_username ? getUser(row.created_by_username) : null;
      return {
        ...row,
        author: author
          ? {
              username: author.username,
              role: author.role,
              profilePhoto: author.profilePhoto || null
            }
          : null
      };
    });
    
    res.json(profiles);
  });
});

app.get('/api/profiles/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM profiles WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    const author = row.created_by_username ? getUser(row.created_by_username) : null;
    const profile = {
      ...row,
      author: author
        ? {
            username: author.username,
            role: author.role,
            profilePhoto: author.profilePhoto || null
          }
        : null
    };
    
    res.json(profile);
  });
});

app.post('/api/profiles', requireAuth, (req, res) => {
  const { name, email, phone, location, notes } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const sql = `
    INSERT INTO profiles (name, email, phone, location, notes, profile_photo, created_by_username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [name, email, phone, location, notes, null, req.user.username], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      success: true,
      id: this.lastID,
      message: 'Profile created successfully'
    });
  });
});

app.put('/api/profiles/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, location, notes } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.get('SELECT created_by_username FROM profiles WHERE id = ?', [id], (getErr, row) => {
    if (getErr) {
      return res.status(500).json({ error: getErr.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const isOwner = row.created_by_username && row.created_by_username === req.user.username;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const sql = `
      UPDATE profiles 
      SET name = ?, email = ?, phone = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [name, email, phone, location, notes, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    });
  });
});

app.delete('/api/profiles/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT created_by_username FROM profiles WHERE id = ?', [id], (getErr, row) => {
    if (getErr) {
      return res.status(500).json({ error: getErr.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const isOwner = row.created_by_username && row.created_by_username === req.user.username;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const sql = 'DELETE FROM profiles WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Best-effort remove profile uploads folder
      try {
        const dir = path.join(uploadsRoot, 'profiles', String(id));
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        // ignore
      }

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    });
  });
});

// Settings routes
app.post('/api/settings/change-password', requireAuth, (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  if (updatePassword(newPassword)) {
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Export / Import
app.get('/api/profiles/:id/export', requireAuth, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM profiles WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const payload = {
      ...row
    };

    const fileName = `profil-${id}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(payload, null, 2));
  });
});

app.post('/api/profiles/import', requireAuth, (req, res) => {
  const { profile } = req.body;

  const incoming = profile && typeof profile === 'object' ? profile : req.body;
  const name = incoming?.name;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const email = incoming?.email || null;
  const phone = incoming?.phone || null;
  const location = incoming?.location || null;
  const notes = incoming?.notes || null;

  const sql = `
    INSERT INTO profiles (name, email, phone, location, notes, profile_photo, created_by_username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, email, phone, location, notes, null, req.user.username], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Profile photo
app.post('/api/profiles/:id/photo', requireAuth, upload.single('photo'), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  requireProfileManagePermission(req, res, id, () => {
    const relativePath = `/uploads/profiles/${id}/${req.file.filename}`;
    db.run(
      'UPDATE profiles SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [relativePath, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ success: true, profile_photo: relativePath });
      }
    );
  });
});

// Gallery images
app.get('/api/profiles/:id/images', requireAuth, (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM profile_images WHERE profile_id = ? ORDER BY created_at DESC',
    [id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/api/profiles/:id/images', requireAuth, upload.array('images', 20), (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  requireProfileManagePermission(req, res, id, () => {
    const insertSql = 'INSERT INTO profile_images (profile_id, file_path, original_name) VALUES (?, ?, ?)';

    db.serialize(() => {
      const stmt = db.prepare(insertSql);
      files.forEach((file) => {
        const relativePath = `/uploads/profiles/${id}/${file.filename}`;
        stmt.run([id, relativePath, file.originalname]);
      });
      stmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, uploaded: files.length });
      });
    });
  });
});

app.delete('/api/profiles/:id/images/:imageId', requireAuth, (req, res) => {
  const { id, imageId } = req.params;

  requireProfileManagePermission(req, res, id, () => {
    db.get(
      'SELECT * FROM profile_images WHERE id = ? AND profile_id = ?',
      [imageId, id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'Image not found' });
        }

        db.run(
          'DELETE FROM profile_images WHERE id = ? AND profile_id = ?',
          [imageId, id],
          function(delErr) {
            if (delErr) {
              return res.status(500).json({ error: delErr.message });
            }

            // Best-effort file deletion
            try {
              const absolute = path.join(__dirname, row.file_path.replace('/uploads/', 'uploads/'));
              fs.unlinkSync(absolute);
            } catch {
              // ignore
            }

            res.json({ success: true });
          }
        );
      }
    );
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_profiles,
      COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as recent_profiles
    FROM profiles
  `;
  
  db.get(sql, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json(row);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Default login: admin / password123`);
});
