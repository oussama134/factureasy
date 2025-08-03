const express = require('express');
const router = express.Router();
const Facture = require('../models/Facture');
const { authenticateUser, checkOwnership, filterByUser } = require('../middlewears/auth');

// GET toutes les factures (protégé par authentification)
router.get('/', authenticateUser, filterByUser(Facture), async (req, res) => {
  try {
    console.log('🔍 Récupération des factures...');
    const factures = await Facture.find(req.userFilter)
    .populate('client')
    .populate('lignes.produit');
    console.log(`✅ ${factures.length} factures trouvées`);
    res.json(factures);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des factures:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET une facture par ID (protégé par authentification)
router.get('/:id', authenticateUser, checkOwnership(Facture), async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate('client')
      .populate('lignes.produit');
    
    res.json(facture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST nouvelle facture (protégé par authentification)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const numero = await Facture.generateNumero();
    const facture = new Facture({
      ...req.body,
      numero,
      createdBy: req.user.id
    });
    await facture.save();
    res.status(201).json(facture);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE une facture (protégé par authentification)
router.delete('/:id', authenticateUser, checkOwnership(Facture), async (req, res) => {
  try {
    await Facture.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier une facture (protégé par authentification)
router.put('/:id', authenticateUser, checkOwnership(Facture), async (req, res) => {
  try {
    const updatedFacture = await Facture.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('client').populate('lignes.produit');
    
    res.status(200).json(updatedFacture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
