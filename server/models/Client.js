const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  entreprise: String,
  telephone: String,
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Maroc'
    }
  },
  notes: String,
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'prospect'],
    default: 'actif'
  },
  createdBy: {
    type: String, // ID de l'utilisateur Clerk
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
