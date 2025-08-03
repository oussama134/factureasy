const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateUser, checkOwnership, filterByUser } = require('../middlewears/auth');

// GET tous les clients (protégé par authentification)
router.get('/', authenticateUser, filterByUser(Client), async (req, res) => {
  try {
    console.log('🔍 Récupération des clients...');
    const clients = await Client.find(req.userFilter).sort({ nom: 1 });
    console.log(`✅ ${clients.length} clients trouvés`);
    res.json(clients);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des clients:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST add client (protégé par authentification)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      createdBy: req.user.id
    });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE client (protégé par authentification)
router.delete('/:id', authenticateUser, checkOwnership(Client), async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update client (protégé par authentification)
router.put('/:id', authenticateUser, checkOwnership(Client), async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
