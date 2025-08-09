require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://factureasy-client.onrender.com',
  'https://factureasy.onrender.com',
  'https://factureasy-front.vercel.app', // Frontend Vercel exact
  'https://factureasy-front-fdya554ok-oussama134s-projects.vercel.app', // URL de déploiement Vercel
  'https://factureasy.vercel.app', // URL personnalisée Vercel
  'https://factureasy-git-main-oussama134.vercel.app', // URL de déploiement Vercel
  'https://factureasy-oussama134.vercel.app' // URL personnalisée Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme les apps mobiles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email', 'x-user-type']
}));
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const clientsRouter = require('./routes/clients');
const facturesRouter = require('./routes/factures');
const produitsRouter = require('./routes/produits');
const dashboardRouter = require('./routes/dashboard');
const devisRouter = require('./routes/devis');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/factures', facturesRouter);
app.use('/api/produits', produitsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/devis', devisRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/test', require('./routes/test'));

// Configuration MongoDB avec gestion d'erreurs améliorée
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy';
    console.log('🔍 === CONFIGURATION MONGODB ===');
    console.log('🔍 URI:', mongoURI);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Options de connexion MongoDB
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ Connecté à MongoDB avec succès');
    console.log('📊 Base de données:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.error('💡 Vérifiez que :');
    console.error('   1. MongoDB est installé et en cours d\'exécution');
    console.error('   2. Le fichier config.env contient MONGODB_URI');
    console.error('   3. L\'URL de connexion est correcte');
    console.error('   4. MongoDB est accessible sur le port 27017');
    
    // En mode développement, continuer sans MongoDB
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mode développement - Continuation sans MongoDB');
    } else {
      process.exit(1);
    }
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

// Route de test pour vérifier la connexion
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
