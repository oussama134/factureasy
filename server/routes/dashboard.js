const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const Facture = require('../models/Facture');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const { authenticateJWT } = require('../middlewears/jwtAuth');

// GET statistiques du dashboard
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 Récupération des statistiques dashboard...');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    // Utiliser le filtre selon le rôle de l'utilisateur
    const userFilter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    
    // Statistiques des devis
    const totalDevis = await Devis.countDocuments(userFilter);
    const devisAcceptes = await Devis.countDocuments({ ...userFilter, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ ...userFilter, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ ...userFilter, statut: 'envoye' });
    
    // Statistiques des factures
    const totalFactures = await Facture.countDocuments(userFilter);
    const facturesPayees = await Facture.countDocuments({ ...userFilter, statut: 'payee' });
    const facturesEnAttente = await Facture.countDocuments({ ...userFilter, statut: 'envoye' });
    
    // Statistiques des clients
    const totalClients = await Client.countDocuments(userFilter);
    
    // Statistiques des produits
    const totalProduits = await Produit.countDocuments(userFilter);
    
    res.json({
      totalDevis,
      totalFactures,
      totalClients,
      totalProduits,
      devis: {
        total: totalDevis,
        acceptes: devisAcceptes,
        refuses: devisRefuses,
        enAttente: devisEnAttente
      },
      factures: {
        total: totalFactures,
        payees: facturesPayees,
        enAttente: facturesEnAttente
      },
      clients: {
        total: totalClients
      },
      produits: {
        total: totalProduits
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;