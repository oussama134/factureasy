const User = require('../models/User');

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
};