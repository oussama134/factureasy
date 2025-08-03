const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser, requireAdmin } = require('../middlewears/auth');

// GET tous les utilisateurs (admin seulement)
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Récupération de tous les utilisateurs...');
    const users = await User.find({}).select('-__v').sort({ createdAt: -1 });
    console.log(`✅ ${users.length} utilisateurs trouvés`);
    res.json(users);
  } catch (err) {
    console.error('❌ Erreur récupération utilisateurs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET utilisateur par ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.id }).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un nouvel utilisateur (admin seulement)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Création d\'un nouvel utilisateur...');
    const { clerkId, email, firstName, lastName, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }
    
    const user = new User({
      clerkId,
      email,
      firstName,
      lastName,
      role: role || 'user',
      createdBy: req.user.id
    });
    
    await user.save();
    console.log('✅ Utilisateur créé:', user.email);
    res.status(201).json(user);
  } catch (err) {
    console.error('❌ Erreur création utilisateur:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT modifier le rôle d'un utilisateur (admin seulement)
router.put('/:id/role', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Modification du rôle utilisateur...');
    const { role } = req.body;
    
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.id },
      { role },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Rôle modifié pour:', user.email, '->', role);
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur modification rôle:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT activer/désactiver un utilisateur (admin seulement)
router.put('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Modification du statut utilisateur...');
    const { isActive } = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.id },
      { isActive },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Statut modifié pour:', user.email, '->', isActive);
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur modification statut:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un utilisateur (super admin seulement)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Seul un super admin peut supprimer des utilisateurs
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès super admin requis' });
    }
    
    const user = await User.findOneAndDelete({ clerkId: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Utilisateur supprimé:', user.email);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error('❌ Erreur suppression utilisateur:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 