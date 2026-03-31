const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'osint_dashboard.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create profiles table
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      location TEXT,
      notes TEXT,
      profile_photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating profiles table:', err.message);
    }
  });

  // Best-effort migrations for existing databases
  db.run('ALTER TABLE profiles ADD COLUMN profile_photo TEXT', () => {});
  db.run('ALTER TABLE profiles ADD COLUMN created_by_username TEXT', () => {});

  db.run(`
    CREATE TABLE IF NOT EXISTS profile_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      original_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Insert sample data if table is empty
  db.get("SELECT COUNT(*) as count FROM profiles", (err, row) => {
    if (!err && row.count === 0) {
      const sampleProfiles = [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1-555-0123",
          location: "New York, USA",
          notes: "Software engineer, active on GitHub"
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+1-555-0124",
          location: "San Francisco, USA",
          notes: "Security researcher, conference speaker"
        },
        {
          name: "Alex Johnson",
          email: "alex.j@example.com",
          phone: "+1-555-0125",
          location: "London, UK",
          notes: "OSINT specialist, blog author"
        }
      ];

      const insertProfile = db.prepare(`
        INSERT INTO profiles (name, email, phone, location, notes)
        VALUES (?, ?, ?, ?, ?)
      `);

      sampleProfiles.forEach(profile => {
        insertProfile.run([profile.name, profile.email, profile.phone, profile.location, profile.notes]);
      });

      insertProfile.finalize();
      console.log('Sample data inserted');
    }
  });
}

module.exports = db;
