import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFactureById } from '../services/factureService';
import StatusWorkflow from '../components/StatusWorkflow';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import './FactureDetail.css';

function FactureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { notification, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchFacture();
  }, [id]);

  const fetchFacture = async () => {
    try {
      setLoading(true);
      const factureData = await getFactureById(id);
      setFacture(factureData);
    } catch (error) {
      console.error('Erreur chargement facture:', error);
      showError('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setFacture(prev => ({
      ...prev,
      statut: newStatus
    }));
  };

  if (loading) {
    return (
      <div className="facture-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="facture-detail-container">
        <div className="error-message">
          <p>❌ Facture non trouvée</p>
          <button onClick={() => navigate('/factures')} className="btn-back">
            ← Retour aux factures
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="facture-detail-container">
        <div className="detail-header">
          <button onClick={() => navigate('/factures')} className="btn-back">
            ← Retour aux factures
          </button>
          <h1>📄 Détails de la Facture</h1>
        </div>

        <div className="detail-content">
          {/* Informations principales */}
          <div className="detail-section">
            <h2>📋 Informations Générales</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Numéro de facture</label>
                <span>{facture._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="info-item">
                <label>Date d'émission</label>
                <span>{new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="info-item">
                <label>Description</label>
                <span>{facture.description || 'Aucune description'}</span>
              </div>
              <div className="info-item">
                <label>Statut actuel</label>
                <span className={`status-badge status-${facture.statut}`}>
                  {facture.statut}
                </span>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="detail-section">
            <h2>👥 Informations Client</h2>
            <div className="client-info">
              <div className="info-item">
                <label>Nom</label>
                <span>{facture.client?.nom || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Entreprise</label>
                <span>{facture.client?.entreprise || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{facture.client?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Téléphone</label>
                <span>{facture.client?.telephone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Lignes de facture */}
          <div className="detail-section">
            <h2>📦 Produits et Services</h2>
            {facture.lignes && facture.lignes.length > 0 ? (
              <div className="lignes-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>TVA</th>
                      <th>Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facture.lignes.map((ligne, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{ligne.produit?.nom || 'Produit inconnu'}</td>
                        <td>{ligne.quantite}</td>
                        <td>{ligne.prixUnitaire?.toFixed(2)} €</td>
                        <td>{ligne.tva}%</td>
                        <td>{(ligne.quantite * ligne.prixUnitaire)?.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-lignes">Aucun produit ajouté à cette facture</p>
            )}
          </div>

          {/* Totaux */}
          <div className="detail-section">
            <h2>💰 Récapitulatif Financier</h2>
            <div className="totaux-grid">
              <div className="total-item">
                <label>Total HT</label>
                <span>{facture.montantHT?.toFixed(2) || '0.00'} €</span>
              </div>
              <div className="total-item">
                <label>Total TVA</label>
                <span>{facture.montantTVA?.toFixed(2) || '0.00'} €</span>
              </div>
              <div className="total-item total-ttc">
                <label>Total TTC</label>
                <span>{facture.montantTTC?.toFixed(2) || '0.00'} €</span>
              </div>
            </div>
          </div>

          {/* Workflow de statut */}
          <div className="detail-section">
            <StatusWorkflow 
              facture={facture} 
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </>
  );
}

export default FactureDetail; 