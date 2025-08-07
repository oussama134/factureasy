const express = require('express');
const router = express.Router();
const Facture = require('../models/Facture');
const { authenticateJWT } = require('../middlewears/jwtAuth');

// GET - Récupérer factures selon le rôle
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION FACTURES ===');
    console.log('👤 Utilisateur connecté:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    console.log('🆔 User ID:', req.user.id);
    
    let factures = [];
    
    if (req.user.role === 'admin') {
      // Admin voit toutes les factures
      factures = await Facture.find({})
        .populate('client')
        .populate('lignes.produit')
        .sort({ dateCreation: -1 });
      console.log('👑 Admin voit toutes les factures:', factures.length);
    } else {
      // User voit seulement ses factures
      factures = await Facture.find({ createdBy: req.user.id })
        .populate('client')
        .populate('lignes.produit')
        .sort({ dateCreation: -1 });
      console.log('👤 User voit ses factures:', factures.length);
    }
    
    res.json(factures);
  } catch (error) {
    console.error('❌ Erreur récupération factures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer facture
router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION FACTURE ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    console.log('📝 Données reçues:', req.body);
    
    // Générer le numéro de facture automatiquement
    const numero = await Facture.generateNumero();
    console.log('🔢 Numéro généré:', numero);
    
    // Calculer la date d'échéance (30 jours après la création)
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);
    
    const factureData = {
      ...req.body,
      numero,
      dateEcheance,
      createdBy: req.user.id
    };
    
    console.log('📝 Données facture préparées:', factureData);
    
    const facture = new Facture(factureData);
    console.log('📋 Facture créée, sauvegarde...');
    
    await facture.save();
    
    // Récupérer la facture avec les données populées
    const facturePopulated = await Facture.findById(facture._id)
      .populate('client')
      .populate('lignes.produit');
    
    console.log('✅ Facture créée:', facture.numero, 'par', req.user.email);
    
    res.status(201).json(facturePopulated);
  } catch (error) {
    console.error('❌ Erreur création facture:', error);
    console.error('❌ Détails erreur:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET - Récupérer une facture spécifique
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate('client')
      .populate('lignes.produit');
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && facture.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(facture);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier une facture
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && facture.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedFacture = await Facture.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedFacture);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une facture
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && facture.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    await Facture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;