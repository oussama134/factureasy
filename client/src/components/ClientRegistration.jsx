import React, { useState } from 'react';
import './ClientRegistration.css';

const ClientRegistration = ({ onClientAdded, onClose }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    entreprise: '',
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: 'France'
    },
    notes: '',
    statut: 'actif'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paysOptions = [
    'France', 'Maroc', 'Algérie', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire',
    'Canada', 'Belgique', 'Suisse', 'Luxembourg', 'Autre'
  ];

  const statutOptions = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'prospect', label: 'Prospect' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('adresse.')) {
      const adresseField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [adresseField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone
    if (formData.telephone && !/^[\d\s\-\+\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    // Validation de l'adresse
    if (formData.adresse.rue && !formData.adresse.ville) {
      newErrors.ville = 'La ville est requise si une rue est saisie';
    }

    if (formData.adresse.ville && !formData.adresse.codePostal) {
      newErrors.codePostal = 'Le code postal est requis si une ville est saisie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Récupérer l'ID de l'utilisateur connecté depuis le localStorage ou le contexte
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const createdBy = currentUser.id || 'user-default';

      const clientData = {
        ...formData,
        createdBy: createdBy
      };

      // Appel API pour créer le client
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du client');
      }

      const newClient = await response.json();
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        email: '',
        entreprise: '',
        telephone: '',
        adresse: {
          rue: '',
          ville: '',
          codePostal: '',
          pays: 'France'
        },
        notes: '',
        statut: 'actif'
      });

      // Notifier le composant parent
      if (onClientAdded) {
        onClientAdded(newClient);
      }

      // Fermer le formulaire
      if (onClose) {
        onClose();
      }

      // Message de succès
      alert('Client créé avec succès !');

    } catch (error) {
      console.error('Erreur création client:', error);
      alert('Erreur lors de la création du client. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nom: '',
      email: '',
      entreprise: '',
      telephone: '',
      adresse: {
        rue: '',
        ville: '',
        codePostal: '',
        pays: 'France'
      },
      notes: '',
      statut: 'actif'
    });
    setErrors({});
  };

  return (
    <div className="client-registration-overlay">
      <div className="client-registration-modal">
        <div className="modal-header">
          <h2>📝 Inscription d'un Nouveau Client</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          {/* Informations principales */}
          <div className="form-section">
            <h3>👤 Informations Principales</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom du Client *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={errors.nom ? 'error' : ''}
                  placeholder="Nom complet ou nom de l'entreprise"
                  required
                />
                {errors.nom && <span className="error-message">{errors.nom}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="client@exemple.com"
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="entreprise">Entreprise</label>
                <input
                  type="text"
                  id="entreprise"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise (optionnel)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={errors.telephone ? 'error' : ''}
                  placeholder="+33 1 23 45 67 89"
                />
                {errors.telephone && <span className="error-message">{errors.telephone}</span>}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="form-section">
            <h3>📍 Adresse</h3>
            
            <div className="form-group">
              <label htmlFor="rue">Rue</label>
              <input
                type="text"
                id="rue"
                name="adresse.rue"
                value={formData.adresse.rue}
                onChange={handleChange}
                placeholder="123 Rue de la Paix"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ville">Ville</label>
                <input
                  type="text"
                  id="ville"
                  name="adresse.ville"
                  value={formData.adresse.ville}
                  onChange={handleChange}
                  className={errors.ville ? 'error' : ''}
                  placeholder="Paris"
                />
                {errors.ville && <span className="error-message">{errors.ville}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="codePostal">Code Postal</label>
                <input
                  type="text"
                  id="codePostal"
                  name="adresse.codePostal"
                  value={formData.adresse.codePostal}
                  onChange={handleChange}
                  className={errors.codePostal ? 'error' : ''}
                  placeholder="75001"
                />
                {errors.codePostal && <span className="error-message">{errors.codePostal}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pays">Pays</label>
              <select
                id="pays"
                name="adresse.pays"
                value={formData.adresse.pays}
                onChange={handleChange}
              >
                {paysOptions.map(pays => (
                  <option key={pays} value={pays}>{pays}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="form-section">
            <h3>📋 Informations Supplémentaires</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="statut">Statut</label>
                <select
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                >
                  {statutOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informations supplémentaires, commentaires..."
                rows="3"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              🔄 Réinitialiser
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              ❌ Annuler
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Création...' : '✅ Créer le Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistration;
