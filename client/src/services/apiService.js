import axios from 'axios';

// Configuration de l'API
const api = axios.create({
  baseURL: 'https://factureasy.onrender.com/api', // Backend sur Render.com
  timeout: 30000, // Augmentation du timeout pour Render
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
    
    // Routes qui ne nécessitent pas d'authentification
    const publicRoutes = ['/auth/login', '/auth/register'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      // Utilisation JWT pour les routes protégées
      const token = getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token JWT ajouté:', token.substring(0, 20) + '...');
      } else {
        console.error('❌ Token JWT manquant - authentification requise');
        throw new Error('Token d\'authentification manquant');
      }
    } else {
      console.log('🔓 Route publique - pas de token requis');
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