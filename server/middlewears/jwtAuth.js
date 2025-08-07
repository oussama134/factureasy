const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification JWT
const authenticateJWT = async (req, res, next) => {
  try {
    console.log('🔍 === AUTHENTIFICATION JWT ===');
    
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token manquant ou format invalide');
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);
    console.log('🔑 Token extrait:', token.substring(0, 20) + '...');
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token décodé:', decoded);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la base');
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
    
    console.log('✅ Authentification JWT réussie pour:', req.user.email);
    console.log('👑 Rôle assigné:', req.user.role);
    
    next();
  } catch (error) {
    console.error('❌ Erreur authentification JWT:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    } else {
      return res.status(401).json({ error: 'Authentification échouée' });
    }
  }
};

// Fonction pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Fonction pour vérifier un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateJWT,
  generateToken,
  verifyToken
}; 