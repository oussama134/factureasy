import { useState, useEffect } from 'react';
import { getProduits } from '../services/produitService';
import { getClients } from '../services/clientService';
import { addFacture } from '../services/factureService';
import useNotification from '../hooks/useNotification';
import Notification from './Notification';
import './FormFacture.css';

function FormFacture({ onFactureCree }) {
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [lignes, setLignes] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('');
  const [statut, setStatut] = useState('brouillon');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produitsData, clientsData] = await Promise.all([
          getProduits(),
          getClients()
        ]);
        setProduits(produitsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données');
      }
    };
    
    fetchData();
  }, []);

  const ajouterLigne = () => {
    const produit = Array.isArray(produits) ? produits.find(p => p._id === selectedProduit) : null;
    if (!produit) {
      showError('Veuillez sélectionner un produit');
      return;
    }

    const prixUnitaire = parseFloat(produit.prix);
    const tva = produit.tva !== undefined && produit.tva !== '' ? parseFloat(produit.tva) : 0;

    const ligne = {
      produit: produit._id,
      quantite: parseFloat(quantite),
      prixUnitaire,
      tva
    };

    setLignes([...lignes, ligne]);
    setSelectedProduit('');
    setQuantite(1);
    showSuccess('Produit ajouté à la facture');
  };

  const calculs = lignes.reduce(
    (acc, l) => {
      const ht = l.prixUnitaire * l.quantite;
      const tva = (ht * l.tva) / 100;
      return {
        montantHT: acc.montantHT + ht,
        montantTVA: acc.montantTVA + tva,
        montantTTC: acc.montantTTC + ht + tva
      };
    },
    { montantHT: 0, montantTVA: 0, montantTTC: 0 }
  );

  const produitsFiltres = Array.isArray(produits) 
    ? (categorie ? produits.filter(p => p.categorie === categorie) : produits)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clientId) {
      showError('Veuillez sélectionner un client');
      return;
    }

    if (lignes.length === 0) {
      showError('Veuillez ajouter au moins un produit');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const facture = {
        client: clientId,
        description,
        lignes,
        montantHT: calculs.montantHT,
        montantTVA: calculs.montantTVA,
        montantTTC: calculs.montantTTC,
        statut
      };
      
      await addFacture(facture);
      showSuccess('Facture créée avec succès !');
      
      // Reset du formulaire
      setClientId('');
      setLignes([]);
      setDescription('');
      setCategorie('');
      setStatut('brouillon');
      
      if (onFactureCree) onFactureCree();
    } catch (error) {
      console.error('Erreur création facture:', error);
      showError('Erreur lors de la création de la facture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supprimerLigne = (index) => {
    setLignes(lignes.filter((_, idx) => idx !== index));
    showSuccess('Ligne supprimée');
  };

  return (
    <>
      <form className="form-facture" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>👥 Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} required>
            <option value="">Choisir un client</option>
            {Array.isArray(clients) && clients.map(c => (
              <option key={c._id} value={c._id}>{c.nom} ({c.entreprise})</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <label>📝 Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de la facture" />
        </div>
        
        <div className="form-row">
          <label>📊 Statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value)}>
            <option value="brouillon">📝 Brouillon</option>
            <option value="envoye">📤 Envoyée</option>
            <option value="payee">✅ Payée</option>
          </select>
        </div>
        
        <div className="form-row">
          <label>🏷️ Catégorie</label>
          <select value={categorie} onChange={e => setCategorie(e.target.value)}>
            <option value="">Toutes catégories</option>
            <option value="patisserie">Pâtisserie</option>
            <option value="electronique">Électronique</option>
            <option value="cafe">Café</option>
          </select>
        </div>
        
        <div className="form-row">
          <label>📦 Produit</label>
          <select value={selectedProduit} onChange={e => setSelectedProduit(e.target.value)}>
            <option value="">Choisir un produit</option>
            {Array.isArray(produitsFiltres) && produitsFiltres.map(p => (
              <option key={p._id} value={p._id}>{p.nom} - {p.prix}€ HT</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <label>🔢 Quantité</label>
          <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min={1} />
          <button type="button" className="btn-secondary" onClick={ajouterLigne}>➕ Ajouter produit</button>
        </div>
        
        <div className="form-lignes">
          <h4>📋 Lignes de facture ({lignes.length})</h4>
          <ul>
            {Array.isArray(lignes) && lignes.map((l, i) => (
              <li key={i} className="ligne-facture">
                <div className="ligne-info">
                  <strong>{Array.isArray(produits) ? produits.find(p => p._id === l.produit)?.nom || l.produit : l.produit}</strong>
                  <span>Qte: {l.quantite} | PU: {l.prixUnitaire}€ | TVA: {l.tva}%</span>
                </div>
                <button type="button" className="btn-supprimer" onClick={() => supprimerLigne(i)}>🗑️</button>
              </li>
            ))}
          </ul>
          {lignes.length === 0 && (
            <p className="no-lignes">Aucun produit ajouté</p>
          )}
        </div>
        
        <div className="form-totaux">
          <p><b>💰 Total HT:</b> {calculs.montantHT.toFixed(2)} €</p>
          <p><b>📊 Total TVA:</b> {calculs.montantTVA.toFixed(2)} €</p>
          <p><b>💳 Total TTC:</b> {calculs.montantTTC.toFixed(2)} €</p>
        </div>
        
        <button 
          type="submit" 
          className="btn-principale" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Création...' : '✅ Créer la facture'}
        </button>
      </form>

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

export default FormFacture;
