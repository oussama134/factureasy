const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const { authenticateJWT } = require('../middlewears/jwtAuth');

// GET tous les devis (protégé par authentification)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION DEVIS ===');
    console.log('👤 Utilisateur connecté:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    console.log('🆔 User ID:', req.user.id);
    
    let devis = [];
    
    if (req.user.role === 'admin') {
      // Admin voit tous les devis
      devis = await Devis.find({})
        .populate('client')
        .populate('lignes.produit')
        .populate('factureGeneree')
        .populate('createdBy', 'email firstName lastName')
        .sort({ dateCreation: -1 });
      console.log('👑 Admin voit tous les devis:', devis.length);
    } else {
      // User voit seulement ses devis
      devis = await Devis.find({ createdBy: req.user.id })
        .populate('client')
        .populate('lignes.produit')
        .populate('factureGeneree')
        .populate('createdBy', 'email firstName lastName')
        .sort({ dateCreation: -1 });
      console.log('👤 User voit ses devis:', devis.length);
    }

    res.json(devis);
  } catch (err) {
    console.error('❌ Erreur récupération devis:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET un devis par ID (protégé par authentification)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION DEVIS PAR ID ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    console.log('🆔 Devis ID:', req.params.id);
    
    const devis = await Devis.findById(req.params.id)
      .populate('client')
      .populate('lignes.produit')
      .populate('factureGeneree')
      .populate('createdBy', 'email firstName lastName');

    if (!devis) {
      console.log('❌ Devis non trouvé');
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    console.log('✅ Devis trouvé:', devis.numero);
    console.log('👤 Créé par:', devis.createdBy);
    console.log('👤 Utilisateur actuel:', req.user.id);

    // Vérifier l'accès - gérer le cas où createdBy est un objet (populate) ou un ObjectId
    const createdById = devis.createdBy._id || devis.createdBy;
    const isOwner = createdById && req.user.id && createdById.equals(req.user.id);
    
    if (req.user.role !== 'admin' && !isOwner) {
      console.log('❌ Accès refusé - Utilisateur non autorisé');
      console.log('🔍 Comparaison:', createdById, '===', req.user.id, 'Résultat:', isOwner);
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    console.log('✅ Accès autorisé, envoi du devis');
    res.json(devis);
  } catch (err) {
    console.error('❌ Erreur récupération devis:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST créer un nouveau devis (protégé par authentification)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION DEVIS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    const numero = await Devis.generateNumero();
    const devis = new Devis({
      ...req.body,
      numero,
      createdBy: req.user.id
    });

    await devis.save();
    
    const devisPopulated = await Devis.findById(devis._id)
      .populate('client')
      .populate('lignes.produit')
      .populate('createdBy', 'email firstName lastName');

    console.log('✅ Devis créé:', devis.numero, 'par', req.user.email);

    res.status(201).json(devisPopulated);
  } catch (err) {
    console.error('❌ Erreur création devis:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT mettre à jour un devis (protégé par authentification)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === MODIFICATION DEVIS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    console.log('🆔 Devis ID:', req.params.id);
    console.log('📝 Données reçues:', req.body);
    
    const devis = await Devis.findById(req.params.id);
    
    if (!devis) {
      console.log('❌ Devis non trouvé');
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    console.log('✅ Devis trouvé:', devis.numero);
    console.log('👤 Créé par:', devis.createdBy);
    console.log('👤 Utilisateur actuel:', req.user.id);

    // Vérifier l'accès - gérer le cas où createdBy est un ObjectId
    const createdById = devis.createdBy;
    const isOwner = createdById && req.user.id && createdById.equals(req.user.id);
    
    if (req.user.role !== 'admin' && !isOwner) {
      console.log('❌ Accès refusé - Utilisateur non autorisé');
      console.log('🔍 Comparaison:', createdById, '===', req.user.id, 'Résultat:', isOwner);
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    console.log('✅ Accès autorisé, mise à jour...');

    // Supprimer createdBy des données de mise à jour pour éviter les erreurs de cast
    const updateData = { ...req.body };
    delete updateData.createdBy;

    const updatedDevis = await Devis.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('client').populate('lignes.produit').populate('createdBy', 'email firstName lastName');

    console.log('✅ Devis mis à jour:', updatedDevis.numero);

    res.json(updatedDevis);
  } catch (err) {
    console.error('❌ Erreur modification devis:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE supprimer un devis (protégé par authentification)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    
    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    // Vérifier l'accès - gérer le cas où createdBy est un ObjectId
    const createdById = devis.createdBy;
    const isOwner = createdById && req.user.id && createdById.equals(req.user.id);
    
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await Devis.findByIdAndDelete(req.params.id);

    res.json({ message: 'Devis supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression devis:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST convertir un devis en facture (protégé par authentification)
router.post('/:id/convert', authenticateJWT, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    
    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    // Vérifier l'accès - gérer le cas où createdBy est un ObjectId
    const createdById = devis.createdBy;
    const isOwner = createdById && req.user.id && createdById.equals(req.user.id);
    
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

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
    console.error('❌ Erreur conversion devis:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT changer le statut d'un devis (protégé par authentification)
router.put('/:id/status', authenticateJWT, async (req, res) => {
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
router.get('/stats/overview', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === STATISTIQUES DEVIS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    let filter = {};
    
    if (req.user.role !== 'admin') {
      // User voit seulement ses statistiques
      filter = { createdBy: req.user.id };
      console.log('👤 Filtrage par utilisateur:', req.user.id);
    } else {
      console.log('👑 Admin voit toutes les statistiques');
    }
    
    const totalDevis = await Devis.countDocuments(filter);
    const devisAcceptes = await Devis.countDocuments({ ...filter, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ ...filter, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ ...filter, statut: 'envoye' });
    const devisExpires = await Devis.countDocuments({ ...filter, statut: 'expire' });

    // Calcul du taux de conversion
    const tauxConversion = totalDevis > 0 ? (devisAcceptes / totalDevis) * 100 : 0;

    // Montant total des devis acceptés
    const devisAcceptesData = await Devis.find({ ...filter, statut: 'accepte' });
    const montantTotalAccepte = devisAcceptesData.reduce((total, devis) => total + devis.montantTTC, 0);

    console.log('📊 Statistiques calculées:', {
      totalDevis,
      devisAcceptes,
      devisRefuses,
      devisEnAttente,
      devisExpires,
      tauxConversion: Math.round(tauxConversion * 100) / 100
    });

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
    console.error('❌ Erreur statistiques devis:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET devis par statut (protégé par authentification)
router.get('/status/:statut', authenticateJWT, async (req, res) => {
  try {
    let filter = { statut: req.params.statut };
    
    if (req.user.role !== 'admin') {
      // User voit seulement ses devis
      filter = { ...filter, createdBy: req.user.id };
    }
    
    const devis = await Devis.find(filter)
      .populate('client')
      .populate('lignes.produit')
      .sort({ dateCreation: -1 });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET devis expirés (protégé par authentification)
router.get('/expired', authenticateJWT, async (req, res) => {
  try {
    let filter = {
      dateValidite: { $lt: new Date() },
      statut: { $in: ['brouillon', 'envoye'] }
    };
    
    if (req.user.role !== 'admin') {
      // User voit seulement ses devis expirés
      filter = { ...filter, createdBy: req.user.id };
    }
    
    const devis = await Devis.find(filter)
      .populate('client')
      .populate('lignes.produit')
      .sort({ dateValidite: 1 });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 