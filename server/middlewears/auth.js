const jwt = require('jsonwebtoken');
const axios = require('axios');
const { clerkClient } = require('@clerk/backend');
const User = require('../models/User');

// Middleware d'authentification avec gestion des rôles dynamiques
const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔍 === DEBUG AUTHENTIFICATION ===');
    console.log('🔍 URL:', req.url);
    console.log('🔍 Méthode:', req.method);
    
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token manquant dans les headers');
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    const token = authHeader.substring(7); // Enlever "Bearer "
    console.log('🔍 Token reçu:', token.substring(0, 50) + '...');
    
    try {
      // Vérifier le token avec Clerk
      const session = await clerkClient.sessions.verifySession(token);
      console.log('✅ Session Clerk vérifiée:', session.id);
      
      // Récupérer les informations de l'utilisateur
      const clerkUser = await clerkClient.users.getUser(session.userId);
      console.log('✅ Utilisateur Clerk récupéré:', clerkUser.emailAddresses[0]?.emailAddress);
      
      // Vérifier si l'utilisateur existe dans notre base de données
      let user = await User.findOne({ clerkId: clerkUser.id });
      
      if (!user) {
        // Créer l'utilisateur s'il n'existe pas
        const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com';
        const firstName = clerkUser.firstName || 'Utilisateur';
        const lastName = clerkUser.lastName || 'Clerk';
        
        user = new User({
          clerkId: clerkUser.id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'user', // Rôle par défaut
          permissions: getDefaultPermissions('user')
        });
        await user.save();
        console.log('✅ Nouvel utilisateur créé:', email);
      }
      
      req.user = {
        id: user.clerkId,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions
      };
      
      console.log('✅ Utilisateur authentifié:', req.user.email);
      console.log('👑 Rôle:', req.user.role);
      console.log('🔐 Permissions:', req.user.permissions);
      
    } catch (clerkError) {
      console.error('❌ Erreur vérification Clerk:', clerkError.message);
      
      // En mode développement, permettre l'authentification simulée
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Mode développement - Authentification simulée');
        const userType = req.headers['x-user-type'] || 'admin';
        
        let userData;
        switch (userType) {
          case 'super_admin':
            userData = {
              id: 'super-admin-123',
              clerkId: 'super-admin-123',
              email: 'superadmin@factureasy.com',
              firstName: 'Super',
              lastName: 'Admin',
              role: 'super_admin'
            };
            break;
          case 'admin':
            userData = {
              id: 'admin-user-123',
              clerkId: 'admin-user-123',
              email: 'admin@factureasy.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin'
            };
            break;
          case 'user':
          default:
            userData = {
              id: 'user-123',
              clerkId: 'user-123',
              email: 'user@factureasy.com',
              firstName: 'Normal',
              lastName: 'User',
              role: 'user'
            };
            break;
        }
        
        let user = await User.findOne({ clerkId: userData.clerkId });
        if (!user) {
          user = new User({
            clerkId: userData.clerkId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            permissions: getDefaultPermissions(userData.role)
          });
          await user.save();
        }
        
        req.user = {
          id: user.clerkId,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        };
        
        console.log('✅ Utilisateur simulé authentifié:', req.user.email);
      } else {
        return res.status(401).json({ error: 'Token invalide' });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    return res.status(401).json({ error: 'Authentification échouée' });
  }
};

// Fonction pour obtenir les permissions par défaut selon le rôle
const getDefaultPermissions = (role) => {
  switch (role) {
    case 'super_admin':
      return ['read_clients', 'write_clients', 'read_factures', 'write_factures', 'read_devis', 'write_devis', 'manage_users', 'view_stats'];
    case 'admin':
      return ['read_clients', 'write_clients', 'read_factures', 'write_factures', 'read_devis', 'write_devis', 'view_stats'];
    case 'user':
    default:
      return ['read_clients', 'write_clients', 'read_factures', 'write_factures', 'read_devis', 'write_devis'];
  }
};

// Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Ressource non trouvée' });
      }

      if (resource.createdBy !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erreur de vérification de propriété:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

// Middleware pour filtrer les ressources par utilisateur (avec gestion des rôles)
const filterByUser = (model) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Si l'utilisateur est admin ou super_admin, pas de filtrage (voir toutes les données)
      if (userRole === 'admin' || userRole === 'super_admin') {
        console.log('👑 Admin détecté - Pas de filtrage appliqué');
        req.userFilter = {};
      } else {
        // Utilisateur normal - filtrer par ses données
        console.log('👤 Utilisateur normal - Filtrage par utilisateur');
        req.userFilter = { createdBy: userId };
      }
      
      next();
    } catch (error) {
      console.error('Erreur de filtrage par utilisateur:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    console.log('👑 Accès admin autorisé pour:', req.user.role);
    next();
  } else {
    console.log('❌ Accès admin refusé pour:', req.user.role);
    return res.status(403).json({ error: 'Accès admin requis' });
  }
};

// Middleware pour vérifier si l'utilisateur peut accéder à une ressource
const canAccessResource = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Ressource non trouvée' });
      }

      // Admin peut accéder à tout
      if (userRole === 'admin') {
        req.resource = resource;
        return next();
      }

      // Utilisateur normal peut accéder seulement à ses ressources
      if (resource.createdBy === userId) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ error: 'Accès non autorisé' });
    } catch (error) {
      console.error('Erreur de vérification d\'accès:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

module.exports = {
  authenticateUser,
  checkOwnership,
  filterByUser,
  requireAdmin,
  canAccessResource
}; 