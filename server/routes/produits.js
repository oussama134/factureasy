const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');
const { authenticateJWT } = require('../middlewears/jwtAuth');

// GET - Récupérer produits selon le rôle
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION PRODUITS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    let produits = [];
    
    if (req.user.role === 'admin') {
      // Admin voit tous les produits
      produits = await Produit.find({});
      console.log('👑 Admin voit tous les produits:', produits.length);
    } else {
      // User voit seulement ses produits
      produits = await Produit.find({ createdBy: req.user.id.toString() });
      console.log('👤 User voit ses produits:', produits.length);
    }
    
    console.log('✅ Envoi de', produits.length, 'produits');
    res.json(produits);
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer produit
router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION PRODUIT ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('🆔 User ID:', req.user.id);
    console.log('👑 Rôle:', req.user.role);
    console.log('📦 Body reçu:', req.body);
    
    const produitData = {
      ...req.body,
      createdBy: req.user.id.toString() // Convertir en string
    };
    
    console.log('📦 Données produit finales:', produitData);
    
    // Vérifier que les champs requis sont présents
    if (!produitData.nom) {
      console.log('❌ Nom manquant');
      return res.status(400).json({ error: 'Nom du produit requis' });
    }
    
    if (!produitData.prix) {
      console.log('❌ Prix manquant');
      return res.status(400).json({ error: 'Prix du produit requis' });
    }
    
    if (!produitData.categorie) {
      console.log('❌ Catégorie manquante');
      return res.status(400).json({ error: 'Catégorie du produit requise' });
    }
    
    const produit = new Produit(produitData);
    console.log('📦 Produit créé (avant save):', produit);
    
    await produit.save();
    
    console.log('✅ Produit créé avec succès:', produit.nom, 'par', req.user.email);
    res.status(201).json(produit);
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET - Récupérer un produit spécifique
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(produit);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier un produit
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedProduit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduit);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un produit
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && produit.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    await Produit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;