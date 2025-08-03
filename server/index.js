require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const clientsRouter = require('./routes/clients');
const facturesRouter = require('./routes/factures');
const produitsRouter = require('./routes/produits');
const dashboardRouter = require('./routes/dashboard');
const devisRouter = require('./routes/devis');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

app.use('/api/clients', clientsRouter);
app.use('/api/factures', facturesRouter);
app.use('/api/produits', produitsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/devis', devisRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

// Configuration MongoDB avec gestion d'erreurs améliorée
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy';
    console.log('🔍 Tentative de connexion à MongoDB...');
    console.log('🔍 URI:', mongoURI);
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connecté à MongoDB avec succès');
    console.log('📊 Base de données:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.error('💡 Vérifiez que :');
    console.error('   1. MongoDB est installé et en cours d\'exécution');
    console.error('   2. Le fichier .env contient MONGODB_URI');
    console.error('   3. L\'URL de connexion est correcte');
    process.exit(1);
  }
};

// Connexion à la base de données
connectDB();

// Événements de connexion MongoDB
mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur de connexion MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Déconnecté de MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Reconnecté à MongoDB');
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
