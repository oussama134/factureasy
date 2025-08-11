# 🗄️ Base de Données FactureEasy - Documentation

## 📊 Vue d'ensemble

La base de données FactureEasy contient maintenant des données complètes de test pour permettre de tester toutes les fonctionnalités de l'application.

## 👥 Utilisateurs de Test

### 🔑 Comptes d'accès

| Email | Mot de passe | Rôle | Description |
|-------|--------------|------|-------------|
| `admin@factureasy.com` | `admin123` | **Admin** | Administrateur avec accès complet |
| `user@factureasy.com` | `user123` | **User** | Utilisateur standard |

## 📦 Produits

### 🏢 Admin (17 produits)
- **Café (4 produits)** : Arabica Premium, Robusta Fort, Décaféiné, Bio Équitable
- **Pâtisserie (13 produits)** : Croissant, Pain au Chocolat, Éclair au Café, Tarte Tatin, Macaron, Mille-feuille, etc.

### 👤 User (5 produits)
- **Électronique (2 produits)** : Smartphone Galaxy S24, Laptop HP Pavilion
- **Vêtements (2 produits)** : T-shirt Premium, Jeans Slim Fit
- **Livres (1 produit)** : "Le Petit Prince" (édition collector)

## 👥 Clients

### 🏢 Admin (9 clients)
- **Cafés et Restaurants** : Café de Paris, Boulangerie Traditionnelle, Restaurant Le Gourmet, Café Central Lyon, Pâtisserie du Sud, Restaurant La Mer
- **Entreprises** : Tech Solutions SARL, Design Studio Pro, Marketing Digital Plus

### 👤 User (5 clients)
- **Boutiques** : Boutique Mode Élégance, Librairie du Savoir, Accessoires Chic, Shoes & Co, Bijoux Précieux

## 📋 Devis

### 🏢 Admin (3 devis)
1. **DEV-2024-001** : Café de Paris - 957.66€ (envoyé)
2. **DEV-2024-002** : Restaurant Le Gourmet - 1044.86€ (accepté)
3. **DEV-2024-003** : Tech Solutions SARL - 1604.28€ (brouillon)

### 👤 User (2 devis)
1. **DEV-2024-004** : Boutique Mode Élégance - 1495.54€ (envoyé)
2. **DEV-2024-005** : Librairie du Savoir - 4859.46€ (accepté)

## 🧾 Factures

### 🏢 Admin (3 factures)
1. **FAC-2024-001** : Café de Paris - 957.66€ (envoyée, échéance 15/02/2024)
2. **FAC-2024-002** : Restaurant Le Gourmet - 1044.86€ (payée le 06/03/2024)
3. **FAC-2024-003** : Tech Solutions SARL - 1604.28€ (envoyée, échéance 25/03/2024)

### 👤 User (2 factures)
1. **FAC-2024-004** : Boutique Mode Élégance - 1495.54€ (envoyée, échéance 18/02/2024)
2. **FAC-2024-005** : Librairie du Savoir - 4859.46€ (payée le 22/02/2024)

## 💰 Montants Totaux

- **Total Devis** : 9,961.80€
- **Total Factures** : 9,961.80€

## 🔧 Scripts Disponibles

### 1. `seed-complete.js`
Script principal pour créer toute la base de données depuis zéro.
```bash
node seed-complete.js
```

### 2. `seed-devis-factures.js`
Script pour ajouter uniquement des devis et factures (nécessite que users, produits et clients existent déjà).
```bash
node seed-devis-factures.js
```

### 3. `verify-database.js`
Script de vérification pour contrôler l'intégrité de la base de données.
```bash
node verify-database.js
```

## 🚀 Fonctionnalités à Tester

### ✅ Authentification
- Connexion avec les comptes admin et user
- Gestion des rôles et permissions

### ✅ Gestion des Produits
- Ajout, modification, suppression de produits
- Gestion des catégories et prix
- Génération automatique des codes produits

### ✅ Gestion des Clients
- Ajout, modification, suppression de clients
- Gestion des adresses et informations de contact
- Séparation par utilisateur

### ✅ Gestion des Devis
- Création de devis avec produits et quantités
- Calculs automatiques (sous-totaux, TVA, remises)
- Gestion des statuts (brouillon, envoyé, accepté, refusé, expiré)
- Gestion des dates de validité

### ✅ Gestion des Factures
- Création de factures basées sur des devis ou directement
- Calculs automatiques des montants
- Gestion des statuts (brouillon, envoyé, payé)
- Gestion des échéances et dates de paiement

### ✅ Calculs Automatiques
- Sous-totaux par ligne avec remises
- Remises globales
- Calcul de la TVA
- Montants HT et TTC

## 🔍 Vérifications Intégrité

- ✅ Tous les devis ont des clients valides
- ✅ Toutes les factures ont des clients valides
- ✅ Tous les devis ont des produits valides
- ✅ Toutes les factures ont des produits valides
- ✅ Relations entre entités cohérentes

## 📝 Notes Importantes

1. **Sécurité** : Les mots de passe sont hashés avec bcrypt (salt rounds: 12)
2. **Relations** : Toutes les entités sont liées par des références MongoDB valides
3. **Calculs** : Les montants sont calculés automatiquement via les middlewares Mongoose
4. **Validation** : Tous les champs respectent les schémas et contraintes définis
5. **Séparation** : Les données sont correctement séparées entre utilisateurs admin et user

## 🎯 Prochaines Étapes

1. **Tester l'interface utilisateur** avec les données créées
2. **Vérifier les calculs** de devis et factures
3. **Tester la création** de nouveaux devis et factures
4. **Valider les permissions** entre rôles admin et user
5. **Tester l'export** et la génération de PDF

---

*Base de données créée et vérifiée avec succès ! 🎉*
