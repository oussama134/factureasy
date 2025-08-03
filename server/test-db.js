require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🧪 Test de connexion à la base de données...');
    console.log('🔍 URI MongoDB:', process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy');
    
    console.log('✅ Connexion réussie !');
    console.log('📊 Base de données:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test des collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections existantes:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('💡 Solutions possibles :');
    console.error('   1. Vérifiez que MongoDB est installé et en cours d\'exécution');
    console.error('   2. Créez un fichier .env avec MONGODB_URI');
    console.error('   3. Vérifiez l\'URL de connexion');
    process.exit(1);
  }
};

testConnection(); 