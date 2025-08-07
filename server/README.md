# FactureEasy Server

Serveur backend pour le système de facturation FactureEasy.

## 🚀 Déploiement sur Render.com

### 1. Prérequis
- Compte Render.com (gratuit)
- Base de données MongoDB Atlas (gratuit)

### 2. Configuration MongoDB Atlas
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit
3. Obtenez votre URL de connexion
4. Remplacez `MONGODB_URI` dans les variables d'environnement

### 3. Déploiement sur Render
1. Connectez votre repository GitHub à Render
2. Créez un nouveau "Web Service"
3. Configurez les variables d'environnement :
   - `NODE_ENV=production`
   - `MONGODB_URI=votre_url_mongodb_atlas`
   - `JWT_SECRET=votre_secret_jwt`
   - `CORS_ORIGIN=https://votre-client-url.onrender.com`

### 4. Variables d'environnement requises
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/factureasy
JWT_SECRET=votre_secret_jwt_super_securise
CORS_ORIGIN=https://factureasy-client.onrender.com
```

## 📦 Installation locale
```bash
npm install
npm start
```

## 🔧 Scripts disponibles
- `npm start` - Démarre le serveur en production
- `npm run dev` - Démarre le serveur en développement
- `node CLEAN-START.js` - Nettoie et initialise la base de données

## 🌐 Endpoints API
- `GET /api/health` - Health check
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/verify` - Vérification JWT
- `GET /api/clients` - Liste des clients
- `GET /api/produits` - Liste des produits
- `GET /api/devis` - Liste des devis
- `GET /api/factures` - Liste des factures
- `GET /api/dashboard/stats` - Statistiques dashboard

## 🔐 Authentification
Le serveur utilise JWT pour l'authentification. Toutes les routes (sauf `/auth/login`) nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`.

## 👥 Rôles utilisateurs
- **admin** : Accès complet à toutes les données
- **user** : Accès limité à ses propres données
