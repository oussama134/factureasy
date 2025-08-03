import api from './apiService';

const API_URL = '/clients';

export const getClients = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
};

export const addClient = async (client) => {
  try {
    const response = await api.post(API_URL, client);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du client:', error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    throw error;
  }
};

export const updateClient = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    throw error;
  }
};
