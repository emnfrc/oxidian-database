const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Create initial config with hashed password
async function setupConfig() {
  const configPath = path.join(__dirname, 'config.json');
  
  // Hash the default password "password123"
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const config = {
    user: {
      username: 'admin',
      password: hashedPassword
    },
    session: {
      secret: 'osint-dashboard-secret-key-change-in-production',
      maxAge: 3600000
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Configuration file created with default credentials:');
  console.log('Username: admin');
  console.log('Password: password123');
}

setupConfig().catch(console.error);
