import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonction pour récupérer le token JWT
const getAuthToken = () => {
  const token = localStorage.getItem('jwt_token');
  return token;
};

// Fonction pour récupérer l'email de l'utilisateur connecté (fallback)
const getUserEmail = () => {
  // Supprimé pour des raisons de sécurité - utilisation JWT uniquement
  console.log('🔍 Tentative d\'utilisation du fallback - NON AUTORISÉ');
  return null;
};

// Intercepteur pour ajouter l'authentification JWT
api.interceptors.request.use(async (config) => {
  try {
    console.log('🔍 === REQUÊTE API ===');
    console.log('🔍 URL:', config.url);
    console.log('🔍 Méthode:', config.method);
    
    // Utilisation JWT uniquement - plus de fallback
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token JWT ajouté:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ Token JWT manquant - authentification requise');
      throw new Error('Token d\'authentification manquant');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des headers:', error);
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.warn('🔐 Erreur d\'authentification 401');
    }
    return Promise.reject(error);
  }
);

// Fonctions supprimées pour des raisons de sécurité
// L'authentification se fait maintenant uniquement via JWT

export default api; 