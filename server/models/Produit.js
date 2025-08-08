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
    unique: true
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

module.exports = mongoose.model('Produit', produitSchema);