import api from './apiService';

// Service pour gérer les utilisateurs
const userService = {
  // Récupérer tous les utilisateurs (admin seulement)
  getAllUsers: async () => {
    try {
      console.log('🔍 Récupération de tous les utilisateurs...');
      const response = await api.get('/users');
      console.log(`✅ ${response.data.length} utilisateurs récupérés`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (userId) => {
    try {
      console.log('🔍 Récupération utilisateur:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('✅ Utilisateur récupéré:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur (admin seulement)
  createUser: async (userData) => {
    try {
      console.log('🔍 Création d\'un nouvel utilisateur...');
      const response = await api.post('/users', userData);
      console.log('✅ Utilisateur créé:', response.data.email);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  },

  // Modifier le rôle d'un utilisateur (admin seulement)
  updateUserRole: async (userId, role) => {
    try {
      console.log('🔍 Modification du rôle utilisateur:', userId, '->', role);
      const response = await api.put(`/users/${userId}/role`, { role });
      console.log('✅ Rôle modifié:', response.data.email, '->', response.data.role);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modification rôle:', error);
      throw error;
    }
  },

  // Activer/désactiver un utilisateur (admin seulement)
  updateUserStatus: async (userId, isActive) => {
    try {
      console.log('🔍 Modification du statut utilisateur:', userId, '->', isActive);
      const response = await api.put(`/users/${userId}/status`, { isActive });
      console.log('✅ Statut modifié:', response.data.email, '->', response.data.isActive);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modification statut:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur (super admin seulement)
  deleteUser: async (userId) => {
    try {
      console.log('🔍 Suppression utilisateur:', userId);
      const response = await api.delete(`/users/${userId}`);
      console.log('✅ Utilisateur supprimé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw error;
    }
  }
};

export default userService; 