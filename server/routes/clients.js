const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateJWT } = require('../middlewears/jwtAuth');

// GET - Récupérer clients selon le rôle
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION CLIENTS ===');
    console.log('👤 Utilisateur:', req.user.email);
    console.log('👑 Rôle:', req.user.role);
    
    let clients = [];
    
    if (req.user.role === 'admin') {
      // Admin voit tous les clients
      clients = await Client.find({});
      console.log('👑 Admin voit tous les clients:', clients.length);
    } else {
      // User voit seulement ses clients
      clients = await Client.find({ createdBy: req.user.id });
      console.log('👤 User voit ses clients:', clients.length);
    }
    
    console.log('✅ Envoi de', clients.length, 'clients');
    res.json(clients);
  } catch (error) {
    console.error('❌ Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer client
router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 === CRÉATION CLIENT ===');
    console.log('👤 Utilisateur:', req.user.email);
    
    const clientData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const client = new Client(clientData);
    await client.save();
    
    console.log('✅ Client créé:', client.nom, 'par', req.user.email);
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un client spécifique
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier un client
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un client
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    // Vérifier l'accès
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;