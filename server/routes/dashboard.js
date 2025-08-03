const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const Facture = require('../models/Facture');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const { authenticateUser, filterByUser } = require('../middlewears/auth');

// GET statistiques du dashboard (protégé par authentification)
router.get('/stats', authenticateUser, filterByUser(Client), async (req, res) => {
  try {
    console.log('🔍 Récupération des statistiques dashboard...');
    console.log('👤 Utilisateur:', req.user.role);
    console.log('🔍 Filtre appliqué:', req.userFilter);
    
    // Utiliser le filtre selon le rôle de l'utilisateur
    const userFilter = req.userFilter;

    // Statistiques des devis
    const totalDevis = await Devis.countDocuments(userFilter);
    const devisAcceptes = await Devis.countDocuments({ ...userFilter, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ ...userFilter, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ ...userFilter, statut: 'envoye' });
    const devisExpires = await Devis.countDocuments({ ...userFilter, statut: 'expire' });

    // Statistiques des factures
    const totalFactures = await Facture.countDocuments(userFilter);
    const facturesPayees = await Facture.countDocuments({ ...userFilter, statut: 'payee' });
    const facturesEnAttente = await Facture.countDocuments({ ...userFilter, statut: 'envoye' });
    const facturesBrouillon = await Facture.countDocuments({ ...userFilter, statut: 'brouillon' });

    // Statistiques des clients
    const totalClients = await Client.countDocuments(userFilter);
    const clientsActifs = await Client.countDocuments({ ...userFilter, statut: 'actif' });
    const clientsProspects = await Client.countDocuments({ ...userFilter, statut: 'prospect' });

    // Statistiques des produits
    const totalProduits = await Produit.countDocuments(userFilter);
    const produitsActifs = await Produit.countDocuments({ ...userFilter, statut: 'actif' });
    const produitsRupture = await Produit.countDocuments({ ...userFilter, statut: 'rupture' });

    // Calculs financiers
    const devisAcceptesData = await Devis.find({ ...userFilter, statut: 'accepte' });
    const montantTotalDevis = devisAcceptesData.reduce((total, devis) => total + devis.montantTTC, 0);

    const facturesPayeesData = await Facture.find({ ...userFilter, statut: 'payee' });
    const montantTotalFactures = facturesPayeesData.reduce((total, facture) => total + facture.montantTTC, 0);

    // Taux de conversion
    const tauxConversionDevis = totalDevis > 0 ? (devisAcceptes / totalDevis) * 100 : 0;
    const tauxPaiementFactures = totalFactures > 0 ? (facturesPayees / totalFactures) * 100 : 0;

    // Devis récents (7 derniers jours)
    const date7JoursAgo = new Date();
    date7JoursAgo.setDate(date7JoursAgo.getDate() - 7);
    const devisRecents = await Devis.countDocuments({
      ...userFilter,
      dateCreation: { $gte: date7JoursAgo }
    });

    // Factures récentes (7 derniers jours)
    const facturesRecentes = await Facture.countDocuments({
      ...userFilter,
      dateCreation: { $gte: date7JoursAgo }
    });

    // Top 5 clients par montant
    const topClients = await Devis.aggregate([
      { $match: userFilter },
      { $group: { _id: '$client', total: { $sum: '$montantTTC' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'clientInfo' } }
    ]);

    // Top 5 produits par utilisation
    const topProduits = await Devis.aggregate([
      { $match: userFilter },
      { $unwind: '$lignes' },
      { $group: { _id: '$lignes.produit', totalQuantite: { $sum: '$lignes.quantite' } } },
      { $sort: { totalQuantite: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'produits', localField: '_id', foreignField: '_id', as: 'produitInfo' } }
    ]);

    res.json({
      // Statistiques générales
      totalDevis,
      totalFactures,
      totalClients,
      totalProduits,

      // Statistiques des devis
      devis: {
        total: totalDevis,
        acceptes: devisAcceptes,
        refuses: devisRefuses,
        enAttente: devisEnAttente,
        expires: devisExpires,
        tauxConversion: Math.round(tauxConversionDevis * 100) / 100,
        montantTotal: montantTotalDevis,
        recents: devisRecents
      },

      // Statistiques des factures
      factures: {
        total: totalFactures,
        payees: facturesPayees,
        enAttente: facturesEnAttente,
        brouillon: facturesBrouillon,
        tauxPaiement: Math.round(tauxPaiementFactures * 100) / 100,
        montantTotal: montantTotalFactures,
        recentes: facturesRecentes
      },

      // Statistiques des clients
      clients: {
        total: totalClients,
        actifs: clientsActifs,
        prospects: clientsProspects
      },

      // Statistiques des produits
      produits: {
        total: totalProduits,
        actifs: produitsActifs,
        rupture: produitsRupture
      },

      // Top performers
      topClients,
      topProduits,

      // Informations utilisateur
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.firstName + ' ' + req.user.lastName
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 