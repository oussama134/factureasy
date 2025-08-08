const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const router = express.Router();

// Route pour initialiser la base de données de production
router.post('/init-db', async (req, res) => {
  try {
    console.log('🚀 Initialisation de la base de données de production...');
    
    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('⚠️ Des utilisateurs existent déjà dans la base de données');
      return res.json({ 
        message: 'Base de données déjà initialisée',
        users: existingUsers.map(u => ({ email: u.email, role: u.role }))
      });
    }

    // Suppression des données existantes
    await User.deleteMany({});
    await Client.deleteMany({});
    await Produit.deleteMany({});
    console.log('🗑️ Base de données nettoyée');

    // Création des utilisateurs de test
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const adminUser = new User({
      email: 'admin@factureasy.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'FactureEasy',
      role: 'admin',
      company: 'FactureEasy'
    });

    const regularUser = new User({
      email: 'user@factureasy.com',
      password: hashedUserPassword,
      firstName: 'Utilisateur',
      lastName: 'Test',
      role: 'user',
      company: 'Entreprise Test'
    });

    await adminUser.save();
    await regularUser.save();
    console.log('✅ Utilisateurs créés avec succès');

    // Création de données de test pour l'admin
    const adminClients = [
      {
        nom: 'Entreprise ABC',
        email: 'contact@abc.com',
        telephone: '0123456789',
        adresse: {
          rue: '123 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France'
        },
        createdBy: adminUser._id.toString()
      },
      {
        nom: 'Société XYZ',
        email: 'info@xyz.com',
        telephone: '0987654321',
        adresse: {
          rue: '456 Avenue des Champs',
          ville: 'Lyon',
          codePostal: '69001',
          pays: 'France'
        },
        createdBy: adminUser._id.toString()
      }
    ];

    const adminProduits = [
      {
        nom: 'Service de consultation',
        description: 'Consultation professionnelle',
        prix: 150,
        categorie: 'Service',
        createdBy: adminUser._id.toString()
      },
      {
        nom: 'Développement web',
        description: 'Création de site web',
        prix: 500,
        categorie: 'Service',
        createdBy: adminUser._id.toString()
      }
    ];

    await Client.insertMany(adminClients);
    await Produit.insertMany(adminProduits);
    console.log('✅ Données de test créées pour l\'admin');

    // Création de données de test pour l'utilisateur
    const userClients = [
      {
        nom: 'Client Personnel',
        email: 'client@test.com',
        telephone: '0555666777',
        adresse: {
          rue: '789 Boulevard Central',
          ville: 'Marseille',
          codePostal: '13001',
          pays: 'France'
        },
        createdBy: regularUser._id.toString()
      }
    ];

    const userProduits = [
      {
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: 75,
        categorie: 'Produit',
        createdBy: regularUser._id.toString()
      }
    ];

    await Client.insertMany(userClients);
    await Produit.insertMany(userProduits);
    console.log('✅ Données de test créées pour l\'utilisateur');

    console.log('🎉 Base de données de production initialisée avec succès !');
    
    res.json({ 
      message: 'Base de données initialisée avec succès',
      users: [
        { email: 'admin@factureasy.com', role: 'admin', password: 'admin123' },
        { email: 'user@factureasy.com', role: 'user', password: 'user123' }
      ]
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'initialisation de la base de données' });
  }
});

// POST - Login et génération de token JWT
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 === LOGIN JWT ===');
    console.log('📧 Email reçu:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Rechercher l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('✅ Utilisateur trouvé:', user.email);
    console.log('👑 Rôle:', user.role);
    
    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || 'factureasy_super_secret_key_2024_production',
      { expiresIn: '24h' }
    );
    console.log('🔑 Token généré:', token.substring(0, 20) + '...');
    
    // Réponse avec le token et les infos utilisateur
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Connexion réussie'
    });
    
    console.log('✅ Login JWT réussi pour:', user.email);
    
  } catch (error) {
    console.error('❌ Erreur lors du login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET - Vérifier un token (pour le client)
router.get('/verify', async (req, res) => {
  try {
    console.log('🔍 === VÉRIFICATION TOKEN ===');
    
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    // Extraire le token
    const token = authHeader.substring(7);
    
    // Vérifier le token
    const { verifyToken } = require('../middlewears/jwtAuth');
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    res.status(401).json({ 
      valid: false, 
      error: 'Token invalide' 
    });
  }
});

// POST - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔍 === REFRESH TOKEN ===');
    
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    // Extraire le token
    const token = authHeader.substring(7);
    
    // Vérifier le token actuel
    const { verifyToken } = require('../middlewears/jwtAuth');
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Générer un nouveau token
    const newToken = generateToken(user);
    
    res.json({
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur refresh token:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router; 