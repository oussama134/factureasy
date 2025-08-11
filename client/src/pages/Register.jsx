import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format d\'email invalide');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Rediriger vers la connexion avec un message de succès
        navigate('/login', { 
          state: { 
            message: '✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.' 
          } 
        });
      } else {
        setError(result.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      setError('Erreur lors de la création du compte');
      console.error('Erreur inscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>📝 Inscription</h1>
          <p>Créez votre compte FactureEasy</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nom">👤 Nom complet *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Votre nom complet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 caractères"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">🔐 Confirmer le mot de passe *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Répétez votre mot de passe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">🔐 Type de compte *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">👤 Utilisateur Standard</option>
              <option value="admin">👑 Administrateur</option>
            </select>
            <small className="role-description">
              {formData.role === 'user' 
                ? 'Accès aux fonctionnalités de base (clients, produits, devis, factures)' 
                : 'Accès complet à toutes les fonctionnalités et gestion des utilisateurs'
              }
            </small>
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? '🔄 Création...' : '✅ Créer mon compte'}
          </button>
        </form>

        <div className="register-footer">
          <p>🔐 Déjà un compte ?</p>
          <button 
            className="login-link-btn"
            onClick={() => navigate('/login')}
          >
            🚀 Se connecter
          </button>
        </div>

        <div className="info-section">
          <h3>💡 Informations importantes</h3>
          <ul>
            <li>✅ Votre email sera utilisé pour la connexion</li>
            <li>✅ Le mot de passe doit contenir au moins 6 caractères</li>
            <li>✅ Vous pourrez modifier vos informations après la connexion</li>
            <li>✅ Les comptes administrateur ont des privilèges étendus</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;
