import api from './apiService';

const API_URL = '/dashboard';

export const getDashboardStats = async () => {
  try {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}; 