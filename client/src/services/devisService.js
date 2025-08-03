import api from './apiService';

const API_URL = '/devis';

// Récupérer tous les devis
export const getDevis = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    throw error;
  }
};

// Récupérer un devis par ID
export const getDevisById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    throw error;
  }
};

// Créer un nouveau devis
export const createDevis = async (devisData) => {
  try {
    const response = await api.post(API_URL, devisData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    throw error;
  }
};

// Mettre à jour un devis
export const updateDevis = async (id, devisData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, devisData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    throw error;
  }
};

// Supprimer un devis
export const deleteDevis = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    throw error;
  }
};

// Convertir un devis en facture
export const convertDevisToFacture = async (id) => {
  try {
    const response = await api.post(`${API_URL}/${id}/convert`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la conversion du devis:', error);
    throw error;
  }
};

// Changer le statut d'un devis
export const updateDevisStatus = async (id, statusData) => {
  try {
    const response = await api.put(`${API_URL}/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    throw error;
  }
};

// Récupérer les statistiques des devis
export const getDevisStats = async () => {
  try {
    const response = await api.get(`${API_URL}/stats/overview`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Récupérer les devis par statut
export const getDevisByStatus = async (status) => {
  try {
    const response = await api.get(`${API_URL}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des devis par statut:', error);
    throw error;
  }
};

// Récupérer les devis expirés
export const getExpiredDevis = async () => {
  try {
    const response = await api.get(`${API_URL}/expired`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des devis expirés:', error);
    throw error;
  }
}; 