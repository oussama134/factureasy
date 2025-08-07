import { useState, useEffect } from 'react';
import useNotification from '../hooks/useNotification';
import './FormDevis.css';

function FormDevis({ devis, clients, produits, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    client: '',
    dateValidite: '',
    statut: 'brouillon',
    lignes: [],
    remiseGlobale: 0,
    tva: 20,
    conditions: 'Paiement à 30 jours',
    notes: ''
  });

  const [selectedProduit, setSelectedProduit] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [remiseLigne, setRemiseLigne] = useState(0);

  const { showError } = useNotification();

  useEffect(() => {
    if (devis) {
      // Mode édition
      setFormData({
        client: devis.client?._id || devis.client || '',
        dateValidite: devis.dateValidite ? new Date(devis.dateValidite).toISOString().split('T')[0] : '',
        statut: devis.statut || 'brouillon',
        lignes: devis.lignes || [],
        remiseGlobale: devis.remiseGlobale || 0,
        tva: devis.tva || 20,
        conditions: devis.conditions || 'Paiement à 30 jours',
        notes: devis.notes || ''
      });
    } else {
      // Mode création - date de validité par défaut (30 jours)
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dateValidite: defaultDate.toISOString().split('T')[0]
      }));
    }
  }, [devis]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    setSelectedProduit(produitId);
    
    if (produitId) {
                  const produit = Array.isArray(produits) ? produits.find(p => p._id === produitId) : null;
      if (produit) {
        setPrixUnitaire(produit.prix);
      }
    }
  };

  const addLigne = () => {
    if (!selectedProduit || quantite <= 0 || prixUnitaire <= 0) {
      showError('Veuillez remplir tous les champs de la ligne');
      return;
    }

    const produit = Array.isArray(produits) ? produits.find(p => p._id === selectedProduit) : null;
    if (!produit) {
      showError('Produit non trouvé');
      return;
    }

    const nouvelleLigne = {
      produit: selectedProduit,
      quantite: parseFloat(quantite),
      prixUnitaire: parseFloat(prixUnitaire),
      remise: parseFloat(remiseLigne)
    };

    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, nouvelleLigne]
    }));

    // Reset des champs
    setSelectedProduit('');
    setQuantite(1);
    setPrixUnitaire(0);
    setRemiseLigne(0);
  };

  const removeLigne = (index) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const sousTotal = formData.lignes.reduce((total, ligne) => {
      const prixLigne = ligne.prixUnitaire * ligne.quantite;
      const remiseLigne = prixLigne * (ligne.remise / 100);
      return total + (prixLigne - remiseLigne);
    }, 0);

    const montantHT = sousTotal * (1 - formData.remiseGlobale / 100);
    const montantTTC = montantHT * (1 + formData.tva / 100);

    return { sousTotal, montantHT, montantTTC };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs requis
    if (!formData.client) {
      showError('Veuillez sélectionner un client');
      return;
    }

    if (!formData.dateValidite) {
      showError('Veuillez définir une date de validité');
      return;
    }

    if (!formData.lignes || formData.lignes.length === 0) {
      showError('Veuillez ajouter au moins une ligne de produit');
      return;
    }

    // Validation des lignes
    for (let i = 0; i < formData.lignes.length; i++) {
      const ligne = formData.lignes[i];
      if (!ligne.produit) {
        showError(`Ligne ${i + 1}: Produit manquant`);
        return;
      }
      if (!ligne.quantite || ligne.quantite <= 0) {
        showError(`Ligne ${i + 1}: Quantité invalide`);
        return;
      }
      if (!ligne.prixUnitaire || ligne.prixUnitaire <= 0) {
        showError(`Ligne ${i + 1}: Prix unitaire invalide`);
        return;
      }
    }

    const { sousTotal, montantHT, montantTTC } = calculateTotals();

    // Validation et nettoyage des données
    const devisData = {
      ...formData,
      sousTotal: parseFloat(sousTotal) || 0,
      montantHT: parseFloat(montantHT) || 0,
      montantTTC: parseFloat(montantTTC) || 0,
      remiseGlobale: parseFloat(formData.remiseGlobale) || 0,
      tva: parseFloat(formData.tva) || 20,
      lignes: formData.lignes.map(ligne => ({
        produit: ligne.produit,
        quantite: parseFloat(ligne.quantite) || 0,
        prixUnitaire: parseFloat(ligne.prixUnitaire) || 0,
        remise: parseFloat(ligne.remise) || 0
      }))
      // createdBy sera géré par le serveur lors de la création
    };

    console.log('Données du devis préparées:', devisData);
    onSave(devisData);
  };

  const { sousTotal, montantHT, montantTTC } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="form-devis">
      {/* ===== SECTION 1: INFORMATIONS GÉNÉRALES ===== */}
      <div className="form-section">
        <h3>📋 Informations Générales</h3>
        
        {/* Ligne 1: Client et Date de validité */}
        <div className="form-row">
          <div className="form-group">
            <label>👤 Client *</label>
            <select
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un client</option>
              {Array.isArray(clients) && clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.nom} - {client.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>📅 Date de Validité *</label>
            <input
              type="date"
              name="dateValidite"
              value={formData.dateValidite}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Ligne 2: Statut et Remise globale */}
        <div className="form-row">
          <div className="form-group">
            <label>🏷️ Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
            >
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoyé</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>

          <div className="form-group">
            <label>💰 Remise Globale (%)</label>
            <input
              type="number"
              name="remiseGlobale"
              value={formData.remiseGlobale}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Ligne 3: Conditions et TVA */}
        <div className="form-row">
          <div className="form-group">
            <label>📝 Conditions</label>
            <input
              type="text"
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              placeholder="Conditions de paiement"
            />
          </div>

          <div className="form-group">
            <label>📊 TVA (%)</label>
            <input
              type="number"
              name="tva"
              value={formData.tva}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Notes (pleine largeur) */}
        <div className="form-group">
          <label>📝 Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notes additionnelles..."
            rows="3"
          />
        </div>
      </div>

      {/* ===== SECTION 2: LIGNES DE PRODUITS ===== */}
      <div className="form-section">
        <h3>📦 Lignes de Produits</h3>
        
        {/* Formulaire d'ajout de ligne */}
        <div className="add-ligne-form">
          <div className="ligne-inputs">
            {/* Première ligne : Produit et Quantité */}
            <div className="ligne-row">
              {/* Sélection du produit */}
              <div className="form-group">
                <label>Produit</label>
                <select
                  value={selectedProduit}
                  onChange={handleProduitChange}
                >
                  <option value="">Sélectionner un produit</option>
                  {Array.isArray(produits) && produits.map(produit => (
                    <option key={produit._id} value={produit._id}>
                      {produit.nom} - {produit.prix} MAD
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div className="form-group">
                <label>Quantité</label>
                <input
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {/* Deuxième ligne : Prix unitaire et Remise */}
            <div className="ligne-row">
              {/* Prix unitaire */}
              <div className="form-group">
                <label>Prix Unitaire (MAD)</label>
                <input
                  type="number"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Remise ligne */}
              <div className="form-group">
                <label>Remise (%)</label>
                <input
                  type="number"
                  value={remiseLigne}
                  onChange={(e) => setRemiseLigne(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>

            {/* Bouton d'ajout */}
            <div className="ligne-actions">
              <button
                type="button"
                onClick={addLigne}
                className="add-ligne-btn"
              >
                ➕ Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Liste des lignes ajoutées */}
        <div className="lignes-list">
          {Array.isArray(formData.lignes) && formData.lignes.map((ligne, index) => {
            const produit = Array.isArray(produits) ? produits.find(p => p._id === ligne.produit) : null;
            const prixLigne = ligne.prixUnitaire * ligne.quantite;
            const remiseLigne = prixLigne * (ligne.remise / 100);
            const totalLigne = prixLigne - remiseLigne;

            return (
              <div key={index} className="ligne-item">
                <div className="ligne-info">
                  <span className="produit-nom">{produit?.nom || 'Produit inconnu'}</span>
                  <span className="ligne-details">
                    {ligne.quantite} x {ligne.prixUnitaire} MAD
                    {ligne.remise > 0 && ` (-${ligne.remise}%)`}
                  </span>
                </div>
                <div className="ligne-total">
                  <span>{totalLigne.toFixed(2)} MAD</span>
                  <button
                    type="button"
                    onClick={() => removeLigne(index)}
                    className="remove-ligne-btn"
                    title="Supprimer cette ligne"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucune ligne */}
        {(!formData.lignes || formData.lignes.length === 0) && (
          <div className="no-lignes">
            <p>Aucune ligne de produit ajoutée</p>
          </div>
        )}
      </div>

      {/* ===== SECTION 3: CALCUL DES TOTAUX ===== */}
      <div className="form-section totals-section">
        <h3>💰 Totaux</h3>
        
        <div className="totals-grid">
          {/* Sous-total */}
          <div className="total-item">
            <span className="total-label">Sous-total :</span>
            <span className="total-value">{sousTotal.toFixed(2)} MAD</span>
          </div>
          
          {/* Remise globale (si applicable) */}
          {formData.remiseGlobale > 0 && (
            <div className="total-item">
              <span className="total-label">Remise globale ({formData.remiseGlobale}%) :</span>
              <span className="total-value">-{(sousTotal * formData.remiseGlobale / 100).toFixed(2)} MAD</span>
            </div>
          )}
          
          {/* Montant HT */}
          <div className="total-item">
            <span className="total-label">Montant HT :</span>
            <span className="total-value">{montantHT.toFixed(2)} MAD</span>
          </div>
          
          {/* TVA */}
          <div className="total-item">
            <span className="total-label">TVA ({formData.tva}%) :</span>
            <span className="total-value">{(montantHT * formData.tva / 100).toFixed(2)} MAD</span>
          </div>
          
          {/* Total TTC */}
          <div className="total-item total-ttc">
            <span className="total-label">Total TTC :</span>
            <span className="total-value">{montantTTC.toFixed(2)} MAD</span>
          </div>
        </div>
      </div>

      {/* ===== SECTION 4: ACTIONS DU FORMULAIRE ===== */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          ❌ Annuler
        </button>
        <button type="submit" className="btn-save">
          💾 {devis ? 'Modifier' : 'Créer'} le Devis
        </button>
      </div>
    </form>
  );
}

export default FormDevis; 