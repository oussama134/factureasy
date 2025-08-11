const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true 
  },
  prix: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: String,
  tva: { 
    type: Number, 
    default: 20,
    min: 0,
    max: 100
  },
  categorie: {
    type: String, 
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  unite: {
    type: String,
    default: 'pièce'
  },
  codeProduit: {
    type: String,
    sparse: true, // Permet plusieurs valeurs null/undefined
    unique: true,
    default: function() {
      // Générer un code unique basé sur la catégorie et un timestamp
      const timestamp = Date.now().toString(36);
      const category = this.categorie ? this.categorie.substring(0, 3).toUpperCase() : 'PROD';
      return `${category}-${timestamp}`;
    }
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'rupture'],
    default: 'actif'
  },
  createdBy: {
    type: String, // ID de l'utilisateur Clerk
    required: true
  }
}, { timestamps: true });

// Middleware pour générer automatiquement le codeProduit si vide
produitSchema.pre('save', function(next) {
  // Si codeProduit est vide, null ou undefined, générer un code unique
  if (!this.codeProduit || this.codeProduit.trim() === '') {
    const timestamp = Date.now().toString(36);
    const category = this.categorie ? this.categorie.substring(0, 3).toUpperCase() : 'PROD';
    this.codeProduit = `${category}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Produit', produitSchema);