import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Instance axios de base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Fonction pour obtenir le token d'authentification
const getAuthToken = async () => {
  try {
    // Essayer plusieurs méthodes pour récupérer le token
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      return token;
    }
    
    // Fallback: essayer avec useAuth hook
    if (window.Clerk?.user) {
      const token = await window.Clerk.user.getToken();
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(async (config) => {
  try {
    console.log('🔍 Tentative de récupération du token pour:', config.url);
    console.log('🔍 Clerk disponible:', !!window.Clerk);
    console.log('🔍 Session disponible:', !!window.Clerk?.session);
    console.log('🔍 User disponible:', !!window.Clerk?.user);
    
    const token = await getAuthToken();
    console.log('✅ Token récupéré:', token ? 'Présent' : 'Absent');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Headers configurés avec token');
      console.log('🔍 URL finale:', config.baseURL + config.url);
      console.log('🔍 Token format:', token.substring(0, 50) + '...');
      console.log('🔍 Headers complets:', config.headers);
    } else {
      console.warn('❌ Aucun token disponible pour la requête:', config.url);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token:', error);
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas rediriger automatiquement, laisser l'application gérer l'erreur
      console.warn('Erreur d\'authentification 401:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api; 