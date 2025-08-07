import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import useNotification from '../hooks/useNotification';
import './JWTLogin.css';

function JWTLogin() {
  const [email, setEmail] = useState('user@factureasy.com');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  
  const { isSignedIn, user, login, logout } = useAuth();
  const { userRole } = useRole();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Veuillez saisir un email et un mot de passe');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Tentative de login JWT pour:', email);
      
      const result = await login(email, password);
      
      if (result.success) {
        showSuccess(`Connexion réussie pour ${email} (${userRole})`);
        console.log('✅ Login JWT réussi');
      } else {
        showError(result.error || 'Erreur de connexion');
      }
      
    } catch (error) {
      console.error('❌ Erreur login JWT:', error);
      showError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Déconnexion réussie');
  };

  return (
    <div className="jwt-login">
      <h3>🔐 Authentification JWT</h3>
      
      {isSignedIn ? (
        <div className="auth-status">
          <div className="user-info">
            <p>✅ Connecté en tant que : <strong>{user?.email}</strong></p>
            <p>Rôle: <span className="role">{userRole}</span></p>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            disabled={loading}
          >
            🚪 Déconnexion
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>📧 Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@factureasy.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>🔒 Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? '🔄 Connexion...' : '🔑 Se connecter'}
            </button>
          </div>
          
          <div className="test-users">
            <p>👥 Utilisateurs de test :</p>
            <button 
              type="button" 
              onClick={() => {
                setEmail('user@factureasy.com');
                setPassword('user123');
              }}
              className="test-user-btn"
            >
              👤 User (user@factureasy.com)
            </button>
            <button 
              type="button" 
              onClick={() => {
                setEmail('admin@factureasy.com');
                setPassword('admin123');
              }}
              className="test-user-btn"
            >
              👑 Admin (admin@factureasy.com)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default JWTLogin; 