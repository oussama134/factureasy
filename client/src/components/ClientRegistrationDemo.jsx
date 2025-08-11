import React, { useState } from 'react';
import ClientRegistration from './ClientRegistration';
import './ClientRegistrationDemo.css';

const ClientRegistrationDemo = () => {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);

  const handleClientAdded = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    console.log('Nouveau client ajouté:', newClient);
  };

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="client-demo-container">
      <div className="demo-header">
        <h1>🏢 Gestion des Clients - Démonstration</h1>
        <p>Testez le formulaire d'inscription des clients</p>
      </div>

      <div className="demo-actions">
        <button 
          className="btn btn-primary demo-btn"
          onClick={handleOpenForm}
        >
          ➕ Ajouter un Nouveau Client
        </button>
      </div>

      {/* Liste des clients existants */}
      {clients.length > 0 && (
        <div className="clients-list">
          <h3>📋 Clients Ajoutés</h3>
          <div className="clients-grid">
            {clients.map((client, index) => (
              <div key={index} className="client-card">
                <div className="client-header">
                  <h4>{client.nom}</h4>
                  <span className={`status-badge status-${client.statut}`}>
                    {client.statut}
                  </span>
                </div>
                <div className="client-info">
                  <p><strong>📧 Email:</strong> {client.email}</p>
                  {client.entreprise && (
                    <p><strong>🏢 Entreprise:</strong> {client.entreprise}</p>
                  )}
                  {client.telephone && (
                    <p><strong>📞 Téléphone:</strong> {client.telephone}</p>
                  )}
                  {client.adresse.rue && (
                    <div className="address-info">
                      <p><strong>📍 Adresse:</strong></p>
                      <p>{client.adresse.rue}</p>
                      <p>{client.adresse.codePostal} {client.adresse.ville}</p>
                      <p>{client.adresse.pays}</p>
                    </div>
                  )}
                  {client.notes && (
                    <p><strong>📝 Notes:</strong> {client.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucun client */}
      {clients.length === 0 && (
        <div className="no-clients">
          <div className="no-clients-icon">👥</div>
          <h3>Aucun client ajouté</h3>
          <p>Utilisez le bouton ci-dessus pour ajouter votre premier client</p>
        </div>
      )}

      {/* Formulaire d'inscription */}
      {showForm && (
        <ClientRegistration
          onClientAdded={handleClientAdded}
          onClose={handleCloseForm}
        />
      )}

      {/* Instructions d'utilisation */}
      <div className="demo-instructions">
        <h3>💡 Instructions d'Utilisation</h3>
        <div className="instructions-grid">
          <div className="instruction-item">
            <div className="instruction-icon">1️⃣</div>
            <h4>Cliquez sur "Ajouter un Nouveau Client"</h4>
            <p>Le formulaire s'ouvrira dans une modal</p>
          </div>
          <div className="instruction-item">
            <div className="instruction-icon">2️⃣</div>
            <h4>Remplissez les informations</h4>
            <p>Nom et email sont obligatoires, les autres champs sont optionnels</p>
          </div>
          <div className="instruction-item">
            <div className="instruction-icon">3️⃣</div>
            <h4>Validez et créez</h4>
            <p>Le client sera ajouté à la liste et affiché ci-dessus</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegistrationDemo;
