const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['read_clients', 'write_clients', 'read_factures', 'write_factures', 'read_devis', 'write_devis', 'manage_users', 'view_stats']
  }],
  createdBy: {
    type: String, // ID de l'admin qui a créé cet utilisateur
    default: null
  }
}, { timestamps: true });

// Méthode pour vérifier si l'utilisateur a une permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// Méthode pour vérifier si l'utilisateur est admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'super_admin';
};

module.exports = mongoose.model('User', userSchema); 