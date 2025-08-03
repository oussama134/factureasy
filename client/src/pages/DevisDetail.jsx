import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevisById, convertDevisToFacture } from '../services/devisService';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './DevisDetail.css';

function DevisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook de notification
  const { notification, showError, showSuccess, hideNotification } = useNotification();

  useEffect(() => {
    fetchDevis();
  }, [id]);

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const devisData = await getDevisById(id);
      setDevis(devisData);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      showError('Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'brouillon': return 'status-badge draft';
      case 'envoye': return 'status-badge sent';
      case 'accepte': return 'status-badge accepted';
      case 'refuse': return 'status-badge rejected';
      case 'expire': return 'status-badge expired';
      default: return 'status-badge';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'envoye': return 'Envoyé';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'expire': return 'Expiré';
      default: return status;
    }
  };

  const generatePDF = (devis) => {
    try {
      const doc = new jsPDF();
      
      // Configuration des couleurs selon le statut
      const getStatusColor = (statut) => {
        switch (statut) {
          case 'accepte': return [40, 167, 69]; // Vert
          case 'envoye': return [23, 162, 184]; // Bleu
          case 'refuse': return [220, 53, 69]; // Rouge
          case 'brouillon': 
          default: return [255, 193, 7]; // Jaune
        }
      };

      const statusColor = getStatusColor(devis.statut);
      const getStatusText = (statut) => {
        switch (statut) {
          case 'accepte': return 'ACCEPTÉ';
          case 'envoye': return 'ENVOYÉ';
          case 'refuse': return 'REFUSÉ';
          case 'brouillon': 
          default: return 'BROUILLON';
        }
      };

      // En-tête avec logo et informations
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Titre principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTUREASY', 20, 25);
      
      // Sous-titre
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Gestion de Factures et Devis', 20, 35);
      
      // Informations du devis
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DEVIS', 20, 60);
      
      // Numéro et dates
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Numéro: ${devis.numero}`, 20, 75);
      doc.text(`Date de création: ${new Date(devis.dateCreation).toLocaleDateString('fr-FR')}`, 20, 85);
      doc.text(`Date de validité: ${new Date(devis.dateValidite).toLocaleDateString('fr-FR')}`, 20, 95);
      
      // Statut
      doc.setFillColor(...statusColor);
      doc.rect(150, 65, 50, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(getStatusText(devis.statut), 155, 75);
      
      // Informations client
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Informations Client:', 20, 120);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${devis.client?.nom || 'N/A'}`, 20, 135);
      doc.text(`Entreprise: ${devis.client?.entreprise || 'N/A'}`, 20, 145);
      doc.text(`Email: ${devis.client?.email || 'N/A'}`, 20, 155);
      doc.text(`Téléphone: ${devis.client?.telephone || 'N/A'}`, 20, 165);
      
      // Tableau des produits
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Lignes de Produits:', 20, 190);
      
      if (devis.lignes && devis.lignes.length > 0) {
        const tableData = devis.lignes.map((ligne, index) => {
          const produit = ligne.produit;
          const prixLigne = ligne.prixUnitaire * ligne.quantite;
          const remiseLigne = prixLigne * (ligne.remise / 100);
          const totalLigne = prixLigne - remiseLigne;
          
          return [
            index + 1,
            produit?.nom || 'Produit inconnu',
            ligne.quantite,
            `${ligne.prixUnitaire.toFixed(2)} MAD`,
            ligne.remise > 0 ? `${ligne.remise}%` : '-',
            `${totalLigne.toFixed(2)} MAD`
          ];
        });
        
        doc.autoTable({
          startY: 200,
          head: [['#', 'Produit', 'Quantité', 'Prix Unitaire', 'Remise', 'Total']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20 },
            3: { cellWidth: 30 },
            4: { cellWidth: 20 },
            5: { cellWidth: 30 }
          }
        });
      }
      
      // Totaux
      const finalY = doc.lastAutoTable.finalY + 20; // Augmenté de 10 à 20 pour plus d'espace
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Totaux:', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sous-total: ${devis.sousTotal?.toFixed(2)} MAD`, 120, finalY);
      
      if (devis.remiseGlobale > 0) {
        doc.text(`Remise globale (${devis.remiseGlobale}%): -${(devis.sousTotal * devis.remiseGlobale / 100).toFixed(2)} MAD`, 120, finalY + 12);
        doc.text(`Montant HT: ${devis.montantHT?.toFixed(2)} MAD`, 120, finalY + 24);
      } else {
        doc.text(`Montant HT: ${devis.montantHT?.toFixed(2)} MAD`, 120, finalY + 12);
      }
      
      doc.text(`TVA (${devis.tva}%): ${(devis.montantHT * devis.tva / 100).toFixed(2)} MAD`, 120, finalY + 36);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC: ${devis.montantTTC?.toFixed(2)} MAD`, 120, finalY + 52);
      
      // Conditions et notes
      if (devis.conditions || devis.notes) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Informations Supplémentaires:', 20, finalY + 80);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (devis.conditions) {
          doc.text(`Conditions: ${devis.conditions}`, 20, finalY + 95);
        }
        if (devis.notes) {
          doc.text(`Notes: ${devis.notes}`, 20, finalY + 105);
        }
      }
      
      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Document généré par FactureEasy', 20, 280);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 285);
      
      // Sauvegarder le PDF
      doc.save(`devis-${devis.numero}.pdf`);
      showSuccess('PDF du devis généré avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showError('Erreur lors de la génération du PDF');
    }
  };

  if (loading) {
    return (
      <div className="devis-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="devis-detail-container">
        <div className="error-message">
          <p>❌ Devis non trouvé</p>
          <button onClick={() => navigate('/devis')} className="btn-back">
            ← Retour aux devis
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="devis-detail-container">
        <div className="detail-header">
          <button onClick={() => navigate('/devis')} className="btn-back">
            ← Retour aux devis
          </button>
          <h1>📋 Détails du Devis</h1>
        </div>

        <div className="detail-content">
          {/* Informations principales */}
          <div className="detail-section">
            <h2>📋 Informations Générales</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Numéro de devis</label>
                <span>{devis.numero}</span>
              </div>
              <div className="info-item">
                <label>Date de création</label>
                <span>{new Date(devis.dateCreation).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="info-item">
                <label>Date de validité</label>
                <span>{new Date(devis.dateValidite).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="info-item">
                <label>Statut actuel</label>
                <span className={getStatusBadgeClass(devis.statut)}>
                  {getStatusLabel(devis.statut)}
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
                <span>{devis.client?.nom || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Entreprise</label>
                <span>{devis.client?.entreprise || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{devis.client?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Téléphone</label>
                <span>{devis.client?.telephone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Lignes de produits */}
          <div className="detail-section">
            <h2>📦 Lignes de Produits</h2>
            <div className="lignes-table">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Remise</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.lignes && devis.lignes.map((ligne, index) => {
                    const produit = ligne.produit;
                    const prixLigne = ligne.prixUnitaire * ligne.quantite;
                    const remiseLigne = prixLigne * (ligne.remise / 100);
                    const totalLigne = prixLigne - remiseLigne;

                    return (
                      <tr key={index}>
                        <td>{produit?.nom || 'Produit inconnu'}</td>
                        <td>{ligne.quantite}</td>
                        <td>{ligne.prixUnitaire.toFixed(2)} MAD</td>
                        <td>{ligne.remise > 0 ? `${ligne.remise}%` : '-'}</td>
                        <td>{totalLigne.toFixed(2)} MAD</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="detail-section totals-section">
            <h2>💰 Totaux</h2>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Sous-total :</span>
                <span className="total-value">{devis.sousTotal?.toFixed(2)} MAD</span>
              </div>
              
              {devis.remiseGlobale > 0 && (
                <div className="total-item">
                  <span className="total-label">Remise globale ({devis.remiseGlobale}%) :</span>
                  <span className="total-value">-{(devis.sousTotal * devis.remiseGlobale / 100).toFixed(2)} MAD</span>
                </div>
              )}
              
              <div className="total-item">
                <span className="total-label">Montant HT :</span>
                <span className="total-value">{devis.montantHT?.toFixed(2)} MAD</span>
              </div>
              
              <div className="total-item">
                <span className="total-label">TVA ({devis.tva}%) :</span>
                <span className="total-value">{(devis.montantHT * devis.tva / 100).toFixed(2)} MAD</span>
              </div>
              
              <div className="total-item total-ttc">
                <span className="total-label">Total TTC :</span>
                <span className="total-value">{devis.montantTTC?.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Conditions et notes */}
          <div className="detail-section">
            <h2>📝 Informations Supplémentaires</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Conditions de paiement</label>
                <span>{devis.conditions || 'Aucune condition spécifiée'}</span>
              </div>
              <div className="info-item">
                <label>Notes</label>
                <span>{devis.notes || 'Aucune note'}</span>
              </div>
            </div>
          </div>

          {/* Informations de conversion */}
          {devis.factureGeneree && (
            <div className="detail-section">
              <h2>📄 Facture Générée</h2>
              <div className="info-item">
                <label>Facture associée</label>
                <span>Ce devis a été converti en facture</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="detail-actions">
            <button 
              onClick={() => navigate(`/devis?action=edit&id=${devis._id}`)} 
              className="btn-edit"
            >
              ✏️ Modifier le Devis
            </button>
            <button 
              onClick={() => generatePDF(devis)} 
              className="btn-pdf"
            >
              📋 Générer PDF
            </button>
            {devis.statut === 'accepte' && !devis.factureGeneree && (
              <button 
                onClick={async () => {
                  try {
                    console.log('Tentative de conversion du devis:', devis._id);
                    const result = await convertDevisToFacture(devis._id);
                    console.log('Résultat de la conversion:', result);
                    
                    showSuccess('Devis converti en facture avec succès !');
                    
                    // Rediriger vers la facture créée
                    if (result.facture) {
                      setTimeout(() => {
                        navigate(`/factures/${result.facture._id}`);
                      }, 2000);
                    }
                  } catch (error) {
                    console.error('Erreur détaillée lors de la conversion:', error);
                    console.error('Réponse du serveur:', error.response?.data);
                    console.error('Statut HTTP:', error.response?.status);
                    
                    let errorMessage = 'Erreur lors de la conversion';
                    if (error.response?.data?.error) {
                      errorMessage += `: ${error.response.data.error}`;
                    } else if (error.message) {
                      errorMessage += `: ${error.message}`;
                    }
                    
                    showError(errorMessage);
                  }
                }} 
                className="btn-convert"
              >
                📄 Convertir en Facture
              </button>
            )}
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

export default DevisDetail; 