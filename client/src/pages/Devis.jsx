import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDevis, deleteDevis, updateDevisStatus, convertDevisToFacture, getDevisStats, createDevis, updateDevis } from '../services/devisService';
import { getClients } from '../services/clientService';
import { getProduits } from '../services/produitService';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import FormDevis from '../components/FormDevis';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Devis.css';

function Devis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [devis, setDevis] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchData();
    // Vérifier si on doit ouvrir le modal de création
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('action') === 'create') {
      setShowModal(true);
    }
    
    // Test de connectivité au serveur
    testServerConnection();
  }, [location]);

  const testServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devis');
      console.log('Test de connectivité serveur:', response.status);
      if (!response.ok) {
        console.error('Serveur non accessible:', response.status, response.statusText);
        showError('Serveur non accessible. Vérifiez que le serveur est démarré.');
      }
    } catch (error) {
      console.error('Erreur de connectivité serveur:', error);
      showError('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré sur le port 5000.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devisData, clientsData, produitsData, statsData] = await Promise.all([
        getDevis(),
        getClients(),
        getProduits(),
        getDevisStats()
      ]);
      
      setDevis(devisData);
      setClients(clientsData);
      setProduits(produitsData);
      setStats(statsData);
    } catch (error) {
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingDevis(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDevis(null);
  };

  const handleEdit = (devis) => {
    setEditingDevis(devis);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await deleteDevis(id);
        showSuccess('Devis supprimé avec succès');
        fetchData();
      } catch (error) {
        showError('Erreur lors de la suppression');
      }
    }
  };

  const handleStatusChange = async (id, newStatus, motifRefus = '') => {
    try {
      await updateDevisStatus(id, { statut: newStatus, motifRefus });
      showSuccess(`Statut du devis mis à jour : ${newStatus}`);
      fetchData();
    } catch (error) {
      showError('Erreur lors du changement de statut');
    }
  };

  const handleConvertToFacture = async (id) => {
    try {
      console.log('Tentative de conversion du devis:', id);
      const result = await convertDevisToFacture(id);
      console.log('Résultat de la conversion:', result);
      
      showSuccess('Devis converti en facture avec succès !');
      fetchData();
      
      // Optionnel : rediriger vers la facture créée
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
  };

  const handleViewDetails = (id) => {
    navigate(`/devis/${id}`);
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

  const filteredDevis = devis.filter(devis => {
    const matchesFilter = filter === 'all' || devis.statut === filter;
    const matchesSearch = devis.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devis.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="devis-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="devis-container">
        <div className="devis-header">
          <div className="header-content">
            <h1>📋 Devis</h1>
            <p>Gérez vos devis et convertissez-les en factures</p>
          </div>
          <button className="add-btn" onClick={handleAddNew}>
            ➕ Nouveau Devis
          </button>
        </div>

        {/* Statistiques */}
        <div className="stats-overview">
          <div className="stat-item">
            <span className="stat-number">{stats.totalDevis || 0}</span>
            <span className="stat-label">Total Devis</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.devisAcceptes || 0}</span>
            <span className="stat-label">Acceptés</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.devisEnAttente || 0}</span>
            <span className="stat-label">En Attente</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.tauxConversion || 0}%</span>
            <span className="stat-label">Taux Conversion</span>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous
            </button>
            <button 
              className={`filter-btn ${filter === 'brouillon' ? 'active' : ''}`}
              onClick={() => setFilter('brouillon')}
            >
              Brouillons
            </button>
            <button 
              className={`filter-btn ${filter === 'envoye' ? 'active' : ''}`}
              onClick={() => setFilter('envoye')}
            >
              Envoyés
            </button>
            <button 
              className={`filter-btn ${filter === 'accepte' ? 'active' : ''}`}
              onClick={() => setFilter('accepte')}
            >
              Acceptés
            </button>
            <button 
              className={`filter-btn ${filter === 'refuse' ? 'active' : ''}`}
              onClick={() => setFilter('refuse')}
            >
              Refusés
            </button>
          </div>
        </div>

        {/* Table des devis */}
        <div className="devis-table-container">
          <table className="devis-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date Création</th>
                <th>Date Validité</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map((devis) => (
                <tr key={devis._id}>
                  <td>
                    <strong>{devis.numero}</strong>
                  </td>
                  <td>{devis.client?.nom}</td>
                  <td>{new Date(devis.dateCreation).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(devis.dateValidite).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <strong>{devis.montantTTC?.toLocaleString('fr-FR')} MAD</strong>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(devis.statut)}>
                      {getStatusLabel(devis.statut)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-container">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewDetails(devis._id)}
                        title="Voir détails"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(devis)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      {devis.statut === 'accepte' && !devis.factureGeneree && (
                        <button 
                          className="action-btn convert"
                          onClick={() => handleConvertToFacture(devis._id)}
                          title="Convertir en facture"
                        >
                          📄
                        </button>
                      )}
                      <button 
                        className="action-btn pdf"
                        onClick={() => generatePDF(devis)}
                        title="Générer PDF"
                      >
                        📋
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(devis._id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDevis.length === 0 && (
            <div className="no-data">
              <p>Aucun devis trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour créer/modifier un devis */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        title={editingDevis ? 'Modifier le Devis' : 'Nouveau Devis'}
      >
        <FormDevis
          devis={editingDevis}
          clients={clients}
          produits={produits}
          onSave={async (devisData) => {
            try {
              console.log('Données du devis à sauvegarder:', devisData);
              
              if (editingDevis) {
                console.log('Mise à jour du devis:', editingDevis._id);
                const result = await updateDevis(editingDevis._id, devisData);
                console.log('Devis mis à jour:', result);
                showSuccess('Devis modifié avec succès');
              } else {
                console.log('Création d\'un nouveau devis');
                const result = await createDevis(devisData);
                console.log('Devis créé:', result);
                showSuccess('Devis créé avec succès');
              }
              handleCloseModal();
              fetchData();
            } catch (error) {
              console.error('Erreur détaillée lors de la sauvegarde:', error);
              console.error('Réponse du serveur:', error.response?.data);
              console.error('Statut HTTP:', error.response?.status);
              
              let errorMessage = 'Erreur lors de la sauvegarde';
              if (error.response?.data?.error) {
                errorMessage += `: ${error.response.data.error}`;
              } else if (error.message) {
                errorMessage += `: ${error.message}`;
              }
              
              showError(errorMessage);
            }
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

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

export default Devis; 