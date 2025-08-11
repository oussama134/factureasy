import { useState, useEffect } from 'react';
import api from '../services/apiService';

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Vérifier si un token JWT existe
        const jwtToken = localStorage.getItem('jwt_token');
        
        if (jwtToken) {
          console.log('🔍 Token JWT trouvé, vérification...');
          
          // Vérifier la validité du token avec le serveur
          const response = await api.get('/auth/verify');
          
          if (response.data.valid && response.data.user) {
            console.log('✅ Token JWT valide');
            setToken(jwtToken);
            setUser(response.data.user);
            setIsSignedIn(true);
          } else {
            console.log('❌ Token JWT invalide');
            localStorage.removeItem('jwt_token');
            setToken(null);
            setUser(null);
            setIsSignedIn(false);
          }
        } else {
          console.log('❌ Aucun token JWT trouvé');
          setToken(null);
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        setIsSignedIn(false);
      } finally {
        setLoading(false); 
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsSignedIn(true);
        console.log('✅ Connexion réussie');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setIsSignedIn(false);
    console.log('✅ Déconnexion réussie');
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        setToken(response.data.token);
        return response.data.token;
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      logout();
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        console.log('✅ Inscription réussie');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Erreur lors de l\'inscription' 
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    isSignedIn,
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    register
  };
}; 