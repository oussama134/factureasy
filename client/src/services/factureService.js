import api from './apiService';

const API_URL = '/factures';

export const getFactures = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    throw error;
  }
};

export const getFactureById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    throw error;
  }
};

export const addFacture = async (facture) => {
  try {
    const response = await api.post(API_URL, facture);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la facture:', error);
    throw error;
  }
};

export const deleteFacture = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    throw error;
  }
};

export const updateFacture = async (id, facture) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, facture);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    throw error;
  }
};
