import api from './apiService';

const AUTH_URL = '/auth';

// Service d'authentification JWT
export const authService = {
  // Login et récupération du token
  async login(email) {
    try {
      console.log('🔍 Tentative de login JWT pour:', email);
      
      const response = await api.post(`${AUTH_URL}/login`, { email });
      
      if (response.data.success) {
        // Stocker le token dans localStorage
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        
        console.log('✅ Login JWT réussi pour:', email);
        console.log('🔑 Token stocké:', response.data.token.substring(0, 20) + '...');
        
        return response.data;
      } else {
        throw new Error('Login échoué');
      }
    } catch (error) {
      console.error('❌ Erreur login JWT:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('jwt_token');
    return !!token;
  },

  // Récupérer le token stocké
  getToken() {
    return localStorage.getItem('jwt_token');
  },

  // Récupérer les infos utilisateur
  getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Vérifier un token
  async verifyToken(token) {
    try {
      const response = await api.post(`${AUTH_URL}/verify`, { token });
      return response.data.valid;
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      return false;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    console.log('✅ Logout effectué');
  },

  // Rafraîchir le token (si nécessaire)
  async refreshToken() {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        throw new Error('Aucun token disponible');
      }

      const isValid = await this.verifyToken(currentToken);
      if (!isValid) {
        this.logout();
        throw new Error('Token expiré');
      }

      return currentToken;
    } catch (error) {
      console.error('❌ Erreur rafraîchissement token:', error);
      this.logout();
      throw error;
    }
  }
};

export default authService; 