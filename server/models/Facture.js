const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateEcheance: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['brouillon', 'envoye', 'payee'],
    default: 'brouillon'
  },
  lignes: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    prixUnitaire: {
      type: Number,
      required: true,
      min: 0
    },
    remise: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  sousTotal: {
    type: Number,
    default: 0
  },
  remiseGlobale: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  montantHT: {
    type: Number,
    default: 0
  },
  tva: {
    type: Number,
    default: 20,
    min: 0
  },
  montantTTC: {
    type: Number,
    default: 0
  },
  conditions: {
    type: String,
    default: 'Paiement à 30 jours'
  },
  notes: {
    type: String
  },
  datePaiement: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Middleware pour calculer automatiquement les montants
factureSchema.pre('save', function(next) {
  try {
    // Vérifier que lignes existe et n'est pas vide
    if (!this.lignes || !Array.isArray(this.lignes) || this.lignes.length === 0) {
      this.sousTotal = 0;
      this.montantHT = 0;
      this.montantTTC = 0;
      return next();
    }

    // Calcul du sous-total
    this.sousTotal = this.lignes.reduce((total, ligne) => {
      if (!ligne.prixUnitaire || !ligne.quantite) {
        return total;
      }
      const prixLigne = ligne.prixUnitaire * ligne.quantite;
      const remiseLigne = prixLigne * ((ligne.remise || 0) / 100);
      return total + (prixLigne - remiseLigne);
    }, 0);

    // Calcul du montant HT après remise globale
    this.montantHT = this.sousTotal * (1 - (this.remiseGlobale || 0) / 100);

    // Calcul du montant TTC
    this.montantTTC = this.montantHT * (1 + (this.tva || 20) / 100);

    next();
  } catch (error) {
    console.error('❌ Erreur calcul montants facture:', error);
    next(error);
  }
});

// Méthode pour générer le numéro de facture
factureSchema.statics.generateNumero = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  return `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('Facture', factureSchema);
