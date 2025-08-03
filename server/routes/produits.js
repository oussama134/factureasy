const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');
const { authenticateUser, checkOwnership, filterByUser } = require('../middlewears/auth');

// GET toutes les produits (protégé par authentification)
router.get('/', authenticateUser, filterByUser(Produit), async (req, res) => {
  try {
    const produits = await Produit.find(req.userFilter).sort({ nom: 1 });
    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST nouvelle produit (protégé par authentification)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const produit = new Produit({
      ...req.body,
      createdBy: req.user.id
    });
    await produit.save();
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE une produit (protégé par authentification)
router.delete('/:id', authenticateUser, checkOwnership(Produit), async (req, res) => {
  try {
    await Produit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT update produit (protégé par authentification)
router.put('/:id', authenticateUser, checkOwnership(Produit), async (req, res) => {
  try {
    const updatedProduit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProduit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
