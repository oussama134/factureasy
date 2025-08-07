const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middlewears/jwtAuth');

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
    
    // Vérifier le mot de passe
    if (user.password !== password) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('✅ Utilisateur trouvé:', user.email);
    console.log('👑 Rôle:', user.role);
    
    // Générer le token JWT
    const token = generateToken(user);
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
    console.error('❌ Erreur login JWT:', error);
    res.status(500).json({ error: 'Erreur serveur' });
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