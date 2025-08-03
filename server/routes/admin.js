const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Facture = require('../models/Facture');
const Devis = require('../models/Devis');
const Produit = require('../models/Produit');
const { authenticateUser, requireAdmin } = require('../middlewears/auth');

// GET statistiques globales (admin seulement)
router.get('/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Récupération des statistiques admin...');
    
    const stats = {
      clients: await Client.countDocuments({}),
      factures: await Facture.countDocuments({}),
      devis: await Devis.countDocuments({}),
      produits: await Produit.countDocuments({}),
      totalMontantFactures: 0,
      totalMontantDevis: 0
    };

    // Calculer les montants totaux
    const factures = await Facture.find({});
    const devis = await Devis.find({});
    
    stats.totalMontantFactures = factures.reduce((sum, f) => sum + (f.montantTTC || 0), 0);
    stats.totalMontantDevis = devis.reduce((sum, d) => sum + (d.montantTTC || 0), 0);

    console.log('✅ Statistiques admin récupérées:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ Erreur statistiques admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET tous les clients (admin seulement)
router.get('/clients', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Récupération de tous les clients (admin)...');
    const clients = await Client.find({}).sort({ nom: 1 });
    console.log(`✅ ${clients.length} clients trouvés (admin)`);
    res.json(clients);
  } catch (err) {
    console.error('❌ Erreur récupération clients admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET toutes les factures (admin seulement)
router.get('/factures', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Récupération de toutes les factures (admin)...');
    const factures = await Facture.find({})
      .populate('client')
      .populate('lignes.produit');
    console.log(`✅ ${factures.length} factures trouvées (admin)`);
    res.json(factures);
  } catch (err) {
    console.error('❌ Erreur récupération factures admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET tous les devis (admin seulement)
router.get('/devis', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Récupération de tous les devis (admin)...');
    const devis = await Devis.find({})
      .populate('client')
      .populate('lignes.produit');
    console.log(`✅ ${devis.length} devis trouvés (admin)`);
    res.json(devis);
  } catch (err) {
    console.error('❌ Erreur récupération devis admin:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 