const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const User = require('./models/User');
const Produit = require('./models/Produit');
const Client = require('./models/Client');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy';

async function CLEAN_START() {
  console.log('🚀 === DÉMARRAGE PROPRE ===');
  
  try {
    // 1. SUPPRIMER TOUT
    console.log('🗑️ Suppression complète de la base...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    await client.db(dbName).dropDatabase();
    await client.close();
    
    // 2. RECONNECTER
    await mongoose.connect(MONGODB_URI);
    
    // 3. CRÉER UTILISATEURS SIMPLES
    console.log('👤 Création utilisateurs simples...');
    
    const adminUser = new User({
      email: 'admin@factureasy.com',
      firstName: 'Admin',
      lastName: 'FactureEasy',
      role: 'admin',
      password: 'admin123' // Simple pour le développement
    });
    await adminUser.save();
    
    const normalUser = new User({
      email: 'user@factureasy.com',
      firstName: 'User',
      lastName: 'FactureEasy',
      role: 'user',
      password: 'user123' // Simple pour le développement
    });
    await normalUser.save();
    
    // 4. CRÉER DONNÉES ISOLÉES
    console.log('📦 Création données isolées...');
    
    // PRODUITS ADMIN
    await Produit.insertMany([
      { nom: 'AUDI Q8', prix: 799.98, categorie: 'Electronique', createdBy: adminUser._id, codeProduit: 'AUDI-001' },
      { nom: 'BMW X5', prix: 899.99, categorie: 'Electronique', createdBy: adminUser._id, codeProduit: 'BMW-001' }
    ]);
    
    // PRODUITS USER
    await Produit.insertMany([
      { nom: 'fiat 500', prix: 350, categorie: 'location', createdBy: normalUser._id, codeProduit: 'FIAT-001' },
      { nom: 'cupra leon', prix: 649.99, categorie: 'location', createdBy: normalUser._id, codeProduit: 'CUPRA-001' },
      { nom: 'peugot 305', prix: 350, categorie: 'location', createdBy: normalUser._id, codeProduit: 'PEUGOT-001' }
    ]);
    
    // CLIENTS ADMIN
    await Client.insertMany([
      { nom: 'Client Admin 1', email: 'admin1@gmail.com', entreprise: 'Admin Corp', telephone: '0123456789', createdBy: adminUser._id },
      { nom: 'Client Admin 2', email: 'admin2@gmail.com', entreprise: 'Admin Inc', telephone: '0987654321', createdBy: adminUser._id }
    ]);
    
    // CLIENTS USER
    await Client.insertMany([
      { nom: 'Client User 1', email: 'user1@gmail.com', entreprise: 'User Corp', telephone: '1111111111', createdBy: normalUser._id },
      { nom: 'Client User 2', email: 'user2@gmail.com', entreprise: 'User Inc', telephone: '2222222222', createdBy: normalUser._id }
    ]);
    
    // 5. AUTHENTIFICATION SIMPLE SANS CLERK
    console.log('🔧 Authentification simple sans Clerk...');
    
    const authContent = `const User = require('../models/User');

// AUTHENTIFICATION SIMPLE SANS CLERK
const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔍 === AUTHENTIFICATION SIMPLE ===');
    
    // Récupérer l'email depuis les headers
    const userEmail = req.headers['x-user-email'];
    console.log('📧 Email reçu:', userEmail);
    
    if (!userEmail) {
      console.log('❌ Email manquant dans les headers');
      return res.status(401).json({ error: 'Email manquant' });
    }
    
    // Rechercher l'utilisateur dans la base
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', userEmail);
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Utilisateur trouvé:', user.email);
    console.log('👑 Rôle:', user.role);
    
    // Construire l'objet utilisateur
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    console.log('✅ Authentification réussie pour:', req.user.email);
    console.log('👑 Rôle assigné:', req.user.role);
    
    next();
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return res.status(401).json({ error: 'Authentification échouée' });
  }
};

module.exports = {
  authenticateUser
};`;
    
    const fs = require('fs');
    fs.writeFileSync('./middlewears/auth.js', authContent);
    
    // 6. ROUTES CLIENTS SIMPLES
    console.log('🔧 Routes clients simples...');
    
    const clientsRouteContent = `const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateUser } = require('../middlewears/auth');

// GET - Récupérer clients selon le rôle
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION CLIENTS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    let clients = [];
    
    if (req.user.role === 'admin') {
      // Admin voit tous les clients
      clients = await Client.find({});
      console.log('👑 Admin voit tous les clients:', clients.length);
    } else {
      // User voit seulement ses clients
      clients = await Client.find({ createdBy: req.user.id });
      console.log('👤 User voit ses clients:', clients.length);
    }
    
    console.log('✅ Envoi de', clients.length, 'clients');
    res.json(clients);
  } catch (error) {
    console.error('❌ Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer client
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION CLIENT ===');
    console.log('👤 Utilisateur:', req.user.email);
    
    const clientData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const client = new Client(clientData);
    await client.save();
    
    console.log('✅ Client créé:', client.nom, 'par', req.user.email);
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un client spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier un client
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un client
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;`;
    
    fs.writeFileSync('./routes/clients.js', clientsRouteContent);
    
    // 7. ROUTES PRODUITS SIMPLES
    console.log('🔧 Routes produits simples...');
    
    const produitsRouteContent = `const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');
const { authenticateUser } = require('../middlewears/auth');

// GET - Récupérer produits selon le rôle
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION PRODUITS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    let produits = [];
    
    if (req.user.role === 'admin') {
      // Admin voit tous les produits
      produits = await Produit.find({});
      console.log('👑 Admin voit tous les produits:', produits.length);
    } else {
      // User voit seulement ses produits
      produits = await Produit.find({ createdBy: req.user.id });
      console.log('👤 User voit ses produits:', produits.length);
    }
    
    console.log('✅ Envoi de', produits.length, 'produits');
    res.json(produits);
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer produit
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION PRODUIT ===');
    console.log('👤 Utilisateur:', req.user.email);
    
    const produitData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const produit = new Produit(produitData);
    await produit.save();
    
    console.log('✅ Produit créé:', produit.nom, 'par', req.user.email);
    res.status(201).json(produit);
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un produit spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(produit);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier un produit
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedProduit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduit);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un produit
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    await Produit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;`;
    
    fs.writeFileSync('./routes/produits.js', produitsRouteContent);
    
    // 8. ROUTES DASHBOARD SIMPLES
    console.log('🔧 Routes dashboard simples...');
    
    const dashboardRouteContent = `const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const Facture = require('../models/Facture');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const { authenticateUser } = require('../middlewears/auth');

// GET statistiques du dashboard
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Récupération des statistiques dashboard...');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    // Utiliser le filtre selon le rôle de l'utilisateur
    const userFilter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    
    // Statistiques des devis
    const totalDevis = await Devis.countDocuments(userFilter);
    const devisAcceptes = await Devis.countDocuments({ ...userFilter, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ ...userFilter, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ ...userFilter, statut: 'envoye' });
    
    // Statistiques des factures
    const totalFactures = await Facture.countDocuments(userFilter);
    const facturesPayees = await Facture.countDocuments({ ...userFilter, statut: 'payee' });
    const facturesEnAttente = await Facture.countDocuments({ ...userFilter, statut: 'envoye' });
    
    // Statistiques des clients
    const totalClients = await Client.countDocuments(userFilter);
    
    // Statistiques des produits
    const totalProduits = await Produit.countDocuments(userFilter);
    
    res.json({
      totalDevis,
      totalFactures,
      totalClients,
      totalProduits,
      devis: {
        total: totalDevis,
        acceptes: devisAcceptes,
        refuses: devisRefuses,
        enAttente: devisEnAttente
      },
      factures: {
        total: totalFactures,
        payees: facturesPayees,
        enAttente: facturesEnAttente
      },
      clients: {
        total: totalClients
      },
      produits: {
        total: totalProduits
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;`;
    
    fs.writeFileSync('./routes/dashboard.js', dashboardRouteContent);
    
    // 9. TEST FINAL
    console.log('🧪 Test final...');
    
    const adminProduits = await Produit.countDocuments({ createdBy: adminUser._id });
    const userProduits = await Produit.countDocuments({ createdBy: normalUser._id });
    const adminClients = await Client.countDocuments({ createdBy: adminUser._id });
    const userClients = await Client.countDocuments({ createdBy: normalUser._id });
    
    console.log('📊 Résultats:');
    console.log(`   Admin: ${adminProduits} produits, ${adminClients} clients`);
    console.log(`   User: ${userProduits} produits, ${userClients} clients`);
    
    console.log('🎉 DÉMARRAGE PROPRE RÉUSSI !');
    console.log('✅ Base propre créée');
    console.log('✅ Authentification simple sans Clerk');
    console.log('✅ Utilisateurs créés:');
    console.log('   - admin@factureasy.com (admin)');
    console.log('   - user@factureasy.com (user)');
    console.log('✅ Toutes les routes simplifiées');
    console.log('✅ Plus de complexité Clerk');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

CLEAN_START(); 