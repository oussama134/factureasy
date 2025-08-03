import api from './apiService';

// Service pour les fonctionnalités d'administration
const adminService = {
  // Récupérer les statistiques globales
  getStats: async () => {
    try {
      console.log('🔍 Récupération des statistiques admin...');
      const response = await api.get('/admin/stats');
      console.log('✅ Statistiques admin récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération statistiques admin:', error);
      throw error;
    }
  },

  // Récupérer tous les clients (admin)
  getAllClients: async () => {
    try {
      console.log('🔍 Récupération de tous les clients (admin)...');
      const response = await api.get('/admin/clients');
      console.log(`✅ ${response.data.length} clients récupérés (admin)`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération clients admin:', error);
      throw error;
    }
  },

  // Récupérer toutes les factures (admin)
  getAllFactures: async () => {
    try {
      console.log('🔍 Récupération de toutes les factures (admin)...');
      const response = await api.get('/admin/factures');
      console.log(`✅ ${response.data.length} factures récupérées (admin)`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération factures admin:', error);
      throw error;
    }
  },

  // Récupérer tous les devis (admin)
  getAllDevis: async () => {
    try {
      console.log('🔍 Récupération de tous les devis (admin)...');
      const response = await api.get('/admin/devis');
      console.log(`✅ ${response.data.length} devis récupérés (admin)`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération devis admin:', error);
      throw error;
    }
  }
};

export default adminService; 