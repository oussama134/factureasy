const express = require('express');
const router = express.Router();

// Route pour forcer l'utilisateur admin
router.get('/force-admin', (req, res) => {
  req.headers['x-user-email'] = 'furboo.oussama10@gmail.com';
  res.json({ 
    message: 'Utilisateur forcé en admin',
    email: 'furboo.oussama10@gmail.com',
    role: 'admin'
  });
});

// Route pour forcer l'utilisateur normal
router.get('/force-user', (req, res) => {
  req.headers['x-user-email'] = 'oussama.aouass10@gmail.com';
  res.json({ 
    message: 'Utilisateur forcé en user normal',
    email: 'oussama.aouass10@gmail.com',
    role: 'user'
  });
});

module.exports = router; 