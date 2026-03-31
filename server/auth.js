const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let config = {};

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configData);
} catch (error) {
  console.error('Error reading config file:', error);
}

function normalizeConfig() {
  if (!config || typeof config !== 'object') {
    config = {};
  }

  if (!Array.isArray(config.users)) {
    config.users = [];
  }

  // Backward compatibility: migrate single-user config.user to config.users
  if (config.user?.username && config.user?.password) {
    const exists = config.users.some((u) => u.username === config.user.username);
    if (!exists) {
      config.users.push({
        username: config.user.username,
        passwordHash: config.user.password,
        role: 'admin',
        suspended: false,
        profilePhoto: null
      });
    }
  }

  // Ensure there is at least one admin user
  if (!config.users.some((u) => u.role === 'admin')) {
    const first = config.users[0];
    if (first) {
      first.role = 'admin';
    }
  }

  config.users = config.users.map((u) => ({
    username: u.username,
    passwordHash: u.passwordHash || u.password || '',
    role: u.role || 'standard',
    suspended: Boolean(u.suspended),
    profilePhoto: u.profilePhoto || null
  }));
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing config file:', error);
    return false;
  }
}

normalizeConfig();

function getUser(username) {
  normalizeConfig();
  return config.users.find((u) => u.username === username) || null;
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }
  return {
    username: user.username,
    role: user.role,
    suspended: Boolean(user.suspended),
    profilePhoto: user.profilePhoto || null
  };
}

function authenticateUser(username, password) {
  const user = getUser(username);
  if (!user) {
    return { ok: false };
  }

  const ok = bcrypt.compareSync(password, user.passwordHash || '');
  if (!ok) {
    return { ok: false };
  }

  return { ok: true, user: toPublicUser(user) };
}

function updatePassword(newPassword) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  try {
    normalizeConfig();
    const admin = config.users.find((u) => u.role === 'admin');
    if (!admin) {
      return false;
    }
    admin.passwordHash = hashedPassword;
    return saveConfig();
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

function setUserPassword(username, newPassword) {
  normalizeConfig();
  const user = config.users.find((u) => u.username === username);
  if (!user) {
    return false;
  }
  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  return saveConfig();
}

function upsertUser({ username, role, suspended, profilePhoto, password }) {
  normalizeConfig();
  if (!username) {
    return { ok: false, error: 'Username is required' };
  }

  const existing = config.users.find((u) => u.username === username);
  if (existing) {
    if (role) existing.role = role;
    if (typeof suspended === 'boolean') existing.suspended = suspended;
    if (typeof profilePhoto === 'string' || profilePhoto === null) existing.profilePhoto = profilePhoto;
    if (password) existing.passwordHash = bcrypt.hashSync(password, 10);
    return saveConfig() ? { ok: true, user: toPublicUser(existing) } : { ok: false, error: 'Failed to save config' };
  }

  if (!password) {
    return { ok: false, error: 'Password is required' };
  }

  const newUser = {
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'standard',
    suspended: Boolean(suspended),
    profilePhoto: profilePhoto || null
  };
  config.users.push(newUser);
  return saveConfig() ? { ok: true, user: toPublicUser(newUser) } : { ok: false, error: 'Failed to save config' };
}

function setUserSuspended(username, suspended) {
  normalizeConfig();
  const user = config.users.find((u) => u.username === username);
  if (!user) {
    return { ok: false, error: 'User not found' };
  }
  user.suspended = Boolean(suspended);
  return saveConfig() ? { ok: true, user: toPublicUser(user) } : { ok: false, error: 'Failed to save config' };
}

function setUserRole(username, role) {
  normalizeConfig();
  const user = config.users.find((u) => u.username === username);
  if (!user) {
    return { ok: false, error: 'User not found' };
  }
  user.role = role;
  return saveConfig() ? { ok: true, user: toPublicUser(user) } : { ok: false, error: 'Failed to save config' };
}

function setUserProfilePhoto(username, profilePhoto) {
  normalizeConfig();
  const user = config.users.find((u) => u.username === username);
  if (!user) {
    return { ok: false, error: 'User not found' };
  }
  user.profilePhoto = profilePhoto;
  return saveConfig() ? { ok: true, user: toPublicUser(user) } : { ok: false, error: 'Failed to save config' };
}

function renameUser(oldUsername, newUsername) {
  normalizeConfig();
  if (!oldUsername || !newUsername) {
    return { ok: false, error: 'Invalid username' };
  }
  if (oldUsername === newUsername) {
    return { ok: true, user: getUser(newUsername) };
  }
  const existing = config.users.find((u) => u.username === oldUsername);
  if (!existing) {
    return { ok: false, error: 'User not found' };
  }
  if (config.users.some((u) => u.username === newUsername)) {
    return { ok: false, error: 'Username already exists' };
  }

  existing.username = newUsername;
  return saveConfig() ? { ok: true, user: toPublicUser(existing) } : { ok: false, error: 'Failed to save config' };
}

function listUsers() {
  normalizeConfig();
  return config.users.map(toPublicUser);
}

function deleteUser(username) {
  normalizeConfig();
  const idx = config.users.findIndex((u) => u.username === username);
  if (idx === -1) {
    return { ok: false, error: 'User not found' };
  }

  const target = config.users[idx];
  if (target.role === 'admin') {
    const adminCount = config.users.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { ok: false, error: 'Cannot delete the last admin user' };
    }
  }

  config.users.splice(idx, 1);
  return saveConfig() ? { ok: true } : { ok: false, error: 'Failed to save config' };
}

module.exports = {
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
  getUser: (username) => toPublicUser(getUser(username)),
  getConfig: () => config
};
