<div align="center">

![Obsidian Database Logo](https://i.imgur.com/e1lT5GP.png)

<p align="center">
  <strong>Application web full-stack pour la gestion sécurisée de profils avec système d'administration</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/SQLite-3-003b57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

</div>

---

## ✨ Fonctionnalités

- 🌙 **Thème sombre moderne** avec effets glassmorphism
- 🔐 **Authentification sécurisée** (sessions + bcrypt)
- 📋 **Gestion de profils** CRUD complète
- 🖼️ **Upload d'images** (photo de profil + galerie)
- 👥 **Panel d'administration** (gestion utilisateurs, rôles, suspension)
- 📊 **Tableau de bord** avec statistiques en temps réel
- ⚙️ **Paramètres système** et gestion de compte
- 📱 **Interface responsive** (desktop & mobile)

---

## 🚀 Stack technique

<table>
<tr>
<td width="50%">

### Frontend
- ⚛️ React 18 + Vite
- 🎨 Tailwind CSS
- 🧭 React Router
- 🔄 Context API

</td>
<td width="50%">

### Backend
- 🟢 Node.js + Express
- 🗄️ SQLite
- 🔒 bcrypt (hachage)
- 🍪 Express Sessions

</td>
</tr>
</table>

---

## 📁 Structure du projet

```
windsurf-project/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── contexts/      # Contextes React
│   │   ├── pages/         # Pages de l'application
│   │   ├── App.jsx        # Composant principal
│   │   └── main.jsx       # Point d'entrée
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                # Backend Node.js
│   ├── database.js        # Configuration SQLite
│   ├── auth.js           # Logique d'authentification
│   ├── config.json       # Configuration utilisateur
│   ├── server.js         # Serveur Express
│   └── package.json
└── README.md
```

---

## ⚡ Installation & Démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm

### 1️⃣ Installation des dépendances

**Backend**
```bash
cd server
npm install
```

**Frontend**
```bash
cd client
npm install
```

### 2️⃣ Lancer l'application

**Backend** (Terminal 1)
```bash
cd server
npm start
```
> Serveur disponible sur `http://localhost:5000`

**Frontend** (Terminal 2)
```bash
cd client
npm run dev
```
> Application disponible sur `http://localhost:3000`

### 3️⃣ Connexion

Ouvre ton navigateur sur **`http://localhost:3000`**

**Identifiants par défaut :**
```
Username: admin
Password: password123
```

---

## ⚙️ Configuration

### Sessions
Dans `server/config.json` :
```json
{
  "session": {
    "secret": "votre-clé-secrete",
    "maxAge": 3600000
  }
}
```

### Utilisateurs
Gère les utilisateurs dans `server/config.json` (tableau `users`).

---

## 🔄 Reset complet

Pour repartir de zéro (⚠️ action destructive) :

```bash
cd server
node scripts/reset.js
```

**Ce script :**
- ❌ Supprime `osint_dashboard.db`
- 🗑️ Vide les dossiers `uploads/`
- 🔄 Réinitialise `config.json` (admin/password123)

Puis relance le backend.

---

## 🛡️ Sécurité

- ✅ Hachage bcrypt des mots de passe
- ✅ Sessions sécurisées
- ✅ Routes protégées
- ✅ Validation des entrées
- ✅ Configuration CORS
- ✅ Prévention des injections SQL (requêtes paramétrées)

---

## 💻 Développement

### Mode développement avec hot reload

```bash
# Backend (avec nodemon)
cd server
npm run dev

# Frontend (avec Vite)
cd client
npm run dev
```

### Build de production

```bash
# Build du frontend
cd client
npm run build

# Démarrer le serveur de production
cd server
npm start
```

---

## 📦 Base de données

L'application utilise **SQLite** :
- **Table des profils** : stocke toutes les informations
- **config.json** : identifiants et paramètres de session

Par défaut, aucune fiche n'est créée automatiquement.

---

## 🌐 GitHub (.gitignore recommandé)

```gitignore
# Dependencies
**/node_modules/

# Build
client/dist/

# SQLite
server/*.db

# Uploads (générés)
server/uploads/profiles/
server/uploads/users/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

---

## 🎯 Utilisation

### 📊 Tableau de bord
- Statistiques générales
- Accès rapide aux fonctionnalités
- Surveillance de l'activité

### 📋 Profils
- **Créer** : nouveaux profils
- **Lire** : liste et détails
- **Modifier** : édition via formulaire
- **Supprimer** : avec confirmation
- **Champs** : nom, email, téléphone, localisation, notes

### ⚙️ Paramètres
- Changement de mot de passe
- Photo de profil
- Informations système

---

## 🚧 Améliorations futures

- [ ] Export/Import de données
- [ ] Recherche et filtrage avancés
- [ ] Support multilingue
- [ ] Journalisation des audits
- [ ] Sauvegarde et restauration automatique

---

## 🤝 Contribution

1. **Fork** le dépôt
2. Créer une **branche de fonctionnalité**
3. **Commit** tes modifications
4. **Tester** soigneusement
5. Soumettre une **Pull Request**

---

## 📄 Licence

**© 2026 Emanuel – All rights reserved**

---

## 💬 Support

Pour les bugs et demandes de fonctionnalités, ouvre une **issue** sur GitHub.

---

<div align="center">

**Développé avec** 💜 **par Emanuel**

<p>
  <a href="#-fonctionnalités">Fonctionnalités</a> •
  <a href="#-installation--démarrage">Installation</a> •
  <a href="#️-sécurité">Sécurité</a> •
  <a href="#-contribution">Contribution</a>
</p>

</div>
