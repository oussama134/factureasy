const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
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
  dateValidite: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'],
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
  factureGeneree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture'
  },
  dateAcceptation: {
    type: Date
  },
  dateRefus: {
    type: Date
  },
  motifRefus: {
    type: String
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
devisSchema.pre('save', function(next) {
  // Calcul du sous-total
  this.sousTotal = this.lignes.reduce((total, ligne) => {
    const prixLigne = ligne.prixUnitaire * ligne.quantite;
    const remiseLigne = prixLigne * (ligne.remise / 100);
    return total + (prixLigne - remiseLigne);
  }, 0);

  // Calcul du montant HT après remise globale
  this.montantHT = this.sousTotal * (1 - this.remiseGlobale / 100);

  // Calcul du montant TTC
  this.montantTTC = this.montantHT * (1 + this.tva / 100);

  next();
});

// Méthode pour générer le numéro de devis
devisSchema.statics.generateNumero = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Méthode pour convertir en facture
devisSchema.methods.convertToFacture = async function() {
  const Facture = mongoose.model('Facture');
  
  const facture = new Facture({
    numero: await Facture.generateNumero(),
    client: this.client,
    dateCreation: new Date(),
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
    statut: 'brouillon',
    lignes: this.lignes,
    sousTotal: this.sousTotal,
    remiseGlobale: this.remiseGlobale,
    montantHT: this.montantHT,
    tva: this.tva,
    montantTTC: this.montantTTC,
    conditions: this.conditions,
    notes: `Facture générée à partir du devis ${this.numero}`,
    createdBy: this.createdBy
  });

  await facture.save();
  
  // Mettre à jour le devis
  this.factureGeneree = facture._id;
  this.statut = 'accepte';
  this.dateAcceptation = new Date();
  await this.save();

  return facture;
};

module.exports = mongoose.model('Devis', devisSchema); 