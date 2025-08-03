import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Factures.css';
import { getFactures, addFacture, deleteFacture, updateFacture } from '../services/factureService';
import { getClients } from '../services/clientService';
import FormFacture from '../components/FormFacture';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Factures() {
  const navigate = useNavigate();
  const location = useLocation();
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [showFormFacture, setShowFormFacture] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFacture, setEditingFacture] = useState({
    clientId: '',
    description: '',
    montant: '',
    statut: 'brouillon',
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchFactures();
    fetchClients();
  }, []);

  // Détecter les paramètres d'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Si on a un paramètre action=create, ouvrir le formulaire
    if (params.get('action') === 'create') {
      setShowFormFacture(true);
      showSuccess('Formulaire de création de facture ouvert !');
    }
    
    // Si on a un filtre par statut
    if (params.get('filter') === 'status') {
      const status = params.get('status');
      setStatutFilter(status);
      showSuccess(`Filtre appliqué : factures ${status}`);
    }
    
    // Si on a un filtre par mois
    if (params.get('filter') === 'month') {
      const month = params.get('month');
      const year = params.get('year');
      // Ici on pourrait ajouter un filtre par date
      showSuccess(`Filtre appliqué : factures de ${month}/${year}`);
    }
  }, [location.search]);

  const fetchFactures = async () => {
    try {
      const facturesData = await getFactures();
      setFactures(facturesData);
    } catch (err) {
      console.error("Erreur chargement factures:", err);
      showError('Erreur lors du chargement des factures');
    }
  };

  const fetchClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (err) {
      console.error("Erreur détaillée :", err.response?.data || err.message);
      showError('Erreur lors du chargement des clients');
    }
  };

  const handleChange = (e) => {
    setEditingFacture({ ...editingFacture, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingFacture,
        client: editingFacture.clientId
      };
      delete payload.clientId;
  
      await updateFacture(editingId, payload);
      showSuccess('Facture modifiée avec succès !');
      handleCloseEditModal();
      await fetchFactures();
    } catch (err) {
      console.error("Erreur enregistrement facture:", err.response?.data || err.message);
      showError('Erreur lors de l\'enregistrement de la facture');
    }
  };

  const handleEdit = (facture) => {
    setEditingFacture({
      clientId: facture.client._id,
      description: facture.description,
      montant: facture.montant,
      statut: facture.statut
    });
    setEditingId(facture._id);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditingFacture({ clientId: '', description: '', montant: '', statut: 'brouillon' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
        showSuccess('Facture supprimée avec succès !');
        await fetchFactures();
      } catch (err) {
        console.error("Erreur suppression:", err);
        showError('Erreur lors de la suppression de la facture');
      }
    }
  };

  function generatePDF(facture) {
    try {
      const doc = new jsPDF();
      
      // Configuration des couleurs selon le statut
      const getStatusColor = (statut) => {
        switch (statut) {
          case 'payee': return [40, 167, 69]; // Vert
          case 'envoye': return [23, 162, 184]; // Bleu
          case 'brouillon': 
          default: return [255, 193, 7]; // Jaune
        }
      };

      const statusColor = getStatusColor(facture.statut);
      const getStatusText = (statut) => {
        switch (statut) {
          case 'payee': return 'PAYÉE';
          case 'envoye': return 'ENVOYÉE';
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
      doc.text('FACTURE', 105, 20, { align: 'center' });
      
      // Numéro de facture
      doc.setFontSize(12);
      doc.text(`N° ${facture._id.slice(-8).toUpperCase()}`, 105, 30, { align: 'center' });
      
      // Statut avec couleur
      doc.setFillColor(...statusColor);
      doc.rect(160, 10, 40, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(getStatusText(facture.statut), 180, 18, { align: 'center' });

      // Informations client
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS CLIENT', 14, 55);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${facture.client?.nom || 'N/A'}`, 14, 65);
      doc.text(`Entreprise: ${facture.client?.entreprise || 'N/A'}`, 14, 72);
      doc.text(`Email: ${facture.client?.email || 'N/A'}`, 14, 79);
      doc.text(`Téléphone: ${facture.client?.telephone || 'N/A'}`, 14, 86);

      // Informations facture
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS FACTURE', 14, 105);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 14, 115);
      doc.text(`Description: ${facture.description || 'Aucune description'}`, 14, 122);
      doc.text(`Statut: ${getStatusText(facture.statut)}`, 14, 129);

      // Tableau des produits
      if (facture.lignes && facture.lignes.length > 0) {
        const lignes = facture.lignes.map((l, i) => [
          i + 1,
          l.produit?.nom || 'Produit inconnu',
          l.quantite,
          `${l.prixUnitaire.toFixed(2)} €`,
          `${l.tva}%`,
          `${(l.quantite * l.prixUnitaire).toFixed(2)} €`
        ]);

        doc.autoTable({
          head: [['#', 'Produit', 'Quantité', 'Prix Unit.', 'TVA', 'Total HT']],
          body: lignes,
          startY: 140,
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 14, right: 14 }
        });
      }

      // Totaux
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 160;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉCAPITULATIF', 14, finalY);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total HT: ${facture.montantHT?.toFixed(2) || '0.00'} €`, 14, finalY + 10);
      doc.text(`Total TVA: ${facture.montantTVA?.toFixed(2) || '0.00'} €`, 14, finalY + 17);
      
      // Total TTC en surbrillance
      doc.setFillColor(102, 126, 234);
      doc.rect(10, finalY + 20, 190, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL TTC: ${facture.montantTTC?.toFixed(2) || '0.00'} €`, 105, finalY + 30, { align: 'center' });

      // Pied de page
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('FactureEasy - Gestion de factures professionnelle', 105, 280, { align: 'center' });
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 285, { align: 'center' });

      doc.save(`facture-${facture._id.slice(-8)}-${getStatusText(facture.statut).toLowerCase()}.pdf`);
      showSuccess('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      showError('Erreur lors de la génération du PDF');
    }
  }

  return (
    <>
      <div className="factures-container">
        <h2>📄 Gestion des Factures</h2>
        <button onClick={() => setShowFormFacture(!showFormFacture)}>
          {showFormFacture ? '❌ Annuler' : '➕ Nouvelle facture'}
        </button>
        {showFormFacture && (
          <FormFacture
            onFactureCree={() => {
              fetchFactures();
              setShowFormFacture(false);
            }}
          />
        )}

        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Rechercher une facture..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
            <option value="">📊 Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="envoye">📤 Envoyée</option>
            <option value="payee">✅ Payée</option>
          </select>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="">👥 Tous clients</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.nom}</option>
            ))}
          </select>
        </div>

        <table className="factures-table">
          <thead>
            <tr>
              <th>👥 Client</th>
              <th>📝 Description</th>
              <th>💰 Montant</th>
              <th>📊 Statut</th>
              <th>📅 Date</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {factures
              .filter(f =>
                (!search ||
                  f.client?.nom?.toLowerCase().includes(search.toLowerCase()) ||
                  f.description?.toLowerCase().includes(search.toLowerCase()) ||
                  f.lignes.some(l => l.produit?.nom?.toLowerCase().includes(search.toLowerCase()))
                ) &&
                (!statutFilter || f.statut === statutFilter) &&
                (!clientFilter || f.client?._id === clientFilter)
              )
              .reverse()
              .map((facture) => (
              <tr key={facture._id}>
                <td>{facture.client?.nom}</td>
                <td>{facture.description}</td>
                <td>{facture.montantTTC ? facture.montantTTC + ' MAD' : ''}</td>
                <td>
                  <span className={`status-badge status-${facture.statut || 'brouillon'}`}>
                    {facture.statut || 'brouillon'}
                  </span>
                </td>
                <td>{new Date(facture.dateEmission).toLocaleDateString()}</td>
                <td>
                  <div className="actions-container">
                    <button 
                      className="action-btn details" 
                      onClick={() => navigate(`/factures/${facture._id}`)}
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn edit" 
                      onClick={() => handleEdit(facture)}
                      title="Modifier"
                    >
                      📝
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(facture._id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                    <button 
                      className="action-btn pdf" 
                      onClick={() => generatePDF(facture)}
                      title="Générer PDF"
                    >
                      📄 PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Modal pour édition de facture */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="📝 Modifier la Facture"
      >
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <label>👥 Client</label>
            <select 
              name="clientId" 
              value={editingFacture.clientId} 
              onChange={handleChange} 
              required
            >
              <option value="">Choisir un client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.nom} ({c.entreprise})</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <label>📝 Description</label>
            <input 
              name="description"
              value={editingFacture.description} 
              onChange={handleChange} 
              placeholder="Description de la facture"
            />
          </div>
          
          <div className="form-row">
            <label>📊 Statut</label>
            <select 
              name="statut" 
              value={editingFacture.statut} 
              onChange={handleChange}
            >
              <option value="brouillon">📝 Brouillon</option>
              <option value="envoye">📤 Envoyée</option>
              <option value="payee">✅ Payée</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-save">
              💾 Sauvegarder
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCloseEditModal}
            >
              ❌ Annuler
            </button>
          </div>
        </form>
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

export default Factures;
