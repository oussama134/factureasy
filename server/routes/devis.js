const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const { authenticateUser, checkOwnership, filterByUser } = require('../middlewears/auth');

// GET tous les devis (protégé par authentification)
router.get('/', authenticateUser, filterByUser(Devis), async (req, res) => {
  try {
    const devis = await Devis.find(req.userFilter)
      .populate('client')
      .populate('lignes.produit')
      .populate('factureGeneree')
      .sort({ dateCreation: -1 });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un devis par ID (protégé par authentification)
router.get('/:id', authenticateUser, checkOwnership(Devis), async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id)
      .populate('client')
      .populate('lignes.produit')
      .populate('factureGeneree');

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un nouveau devis (protégé par authentification)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const numero = await Devis.generateNumero();
    const devis = new Devis({
      ...req.body,
      numero,
      createdBy: req.user.id
    });

    await devis.save();
    
    const devisPopulated = await Devis.findById(devis._id)
      .populate('client')
      .populate('lignes.produit');

    res.status(201).json(devisPopulated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mettre à jour un devis (protégé par authentification)
router.put('/:id', authenticateUser, checkOwnership(Devis), async (req, res) => {
  try {
    const devis = await Devis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('client').populate('lignes.produit');

    res.json(devis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE supprimer un devis (protégé par authentification)
router.delete('/:id', authenticateUser, checkOwnership(Devis), async (req, res) => {
  try {
    const devis = await Devis.findByIdAndDelete(req.params.id);

    res.json({ message: 'Devis supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST convertir un devis en facture (protégé par authentification)
router.post('/:id/convert', authenticateUser, checkOwnership(Devis), async (req, res) => {
  try {
    const devis = req.resource;

    if (devis.statut !== 'accepte') {
      return res.status(400).json({ error: 'Seuls les devis acceptés peuvent être convertis en facture' });
    }

    if (devis.factureGeneree) {
      return res.status(400).json({ error: 'Ce devis a déjà été converti en facture' });
    }

    const facture = await devis.convertToFacture();
    
    const devisUpdated = await Devis.findById(devis._id)
      .populate('client')
      .populate('lignes.produit')
      .populate('factureGeneree');

    res.json({
      message: 'Devis converti en facture avec succès',
      devis: devisUpdated,
      facture: facture
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT changer le statut d'un devis (protégé par authentification)
router.put('/:id/status', authenticateUser, checkOwnership(Devis), async (req, res) => {
  try {
    const { statut, motifRefus } = req.body;
    const updateData = { statut };

    if (statut === 'refuse' && motifRefus) {
      updateData.motifRefus = motifRefus;
      updateData.dateRefus = new Date();
    } else if (statut === 'accepte') {
      updateData.dateAcceptation = new Date();
    }

    const devis = await Devis.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('client').populate('lignes.produit');

    res.json(devis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET statistiques des devis (protégé par authentification)
router.get('/stats/overview', authenticateUser, filterByUser(Devis), async (req, res) => {
  try {
    const totalDevis = await Devis.countDocuments(req.userFilter);
    const devisAcceptes = await Devis.countDocuments({ ...req.userFilter, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ ...req.userFilter, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ ...req.userFilter, statut: 'envoye' });
    const devisExpires = await Devis.countDocuments({ ...req.userFilter, statut: 'expire' });

    // Calcul du taux de conversion
    const tauxConversion = totalDevis > 0 ? (devisAcceptes / totalDevis) * 100 : 0;

    // Montant total des devis acceptés
    const devisAcceptesData = await Devis.find({ ...req.userFilter, statut: 'accepte' });
    const montantTotalAccepte = devisAcceptesData.reduce((total, devis) => total + devis.montantTTC, 0);

    res.json({
      totalDevis,
      devisAcceptes,
      devisRefuses,
      devisEnAttente,
      devisExpires,
      tauxConversion: Math.round(tauxConversion * 100) / 100,
      montantTotalAccepte
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET devis par statut (protégé par authentification)
router.get('/status/:statut', authenticateUser, filterByUser(Devis), async (req, res) => {
  try {
    const devis = await Devis.find({ ...req.userFilter, statut: req.params.statut })
      .populate('client')
      .populate('lignes.produit')
      .sort({ dateCreation: -1 });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET devis expirés (protégé par authentification)
router.get('/expired', authenticateUser, filterByUser(Devis), async (req, res) => {
  try {
    const devis = await Devis.find({
      ...req.userFilter,
      dateValidite: { $lt: new Date() },
      statut: { $in: ['brouillon', 'envoye'] }
    })
      .populate('client')
      .populate('lignes.produit')
      .sort({ dateValidite: 1 });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 