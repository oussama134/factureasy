// Script de nettoyage de la base de données
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Produit = require('./models/Produit');
const Client = require('./models/Client');
const Devis = require('./models/Devis');
const Facture = require('./models/Facture');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connecté à MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const cleanDatabase = async () => {
  try {
    console.log('🧹 === NETTOYAGE DE LA BASE DE DONNÉES ===\n');
    
    // Compter les documents avant suppression
    const usersCount = await User.countDocuments();
    const produitsCount = await Produit.countDocuments();
    const clientsCount = await Client.countDocuments();
    const devisCount = await Devis.countDocuments();
    const facturesCount = await Facture.countDocuments();
    
    console.log('📊 Documents existants :');
    console.log(`   👤 Utilisateurs: ${usersCount}`);
    console.log(`   📦 Produits: ${produitsCount}`);
    console.log(`   👥 Clients: ${clientsCount}`);
    console.log(`   📋 Devis: ${devisCount}`);
    console.log(`   🧾 Factures: ${facturesCount}`);
    
    if (usersCount === 0 && produitsCount === 0 && clientsCount === 0 && devisCount === 0 && facturesCount === 0) {
      console.log('\n✨ La base de données est déjà vide !');
      return;
    }
    
    console.log('\n🗑️  Suppression en cours...');
    
    // Supprimer dans l'ordre pour respecter les références
    if (facturesCount > 0) {
      await Facture.deleteMany({});
      console.log(`✅ ${facturesCount} factures supprimées`);
    }
    
    if (devisCount > 0) {
      await Devis.deleteMany({});
      console.log(`✅ ${devisCount} devis supprimés`);
    }
    
    if (clientsCount > 0) {
      await Client.deleteMany({});
      console.log(`✅ ${clientsCount} clients supprimés`);
    }
    
    if (produitsCount > 0) {
      await Produit.deleteMany({});
      console.log(`✅ ${produitsCount} produits supprimés`);
    }
    
    if (usersCount > 0) {
      await User.deleteMany({});
      console.log(`✅ ${usersCount} utilisateurs supprimés`);
    }
    
    console.log('\n🎉 Base de données nettoyée avec succès !');
    console.log('💡 Utilisez "node seed-complete.js" pour la remplir à nouveau.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await cleanDatabase();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

// Demander confirmation avant suppression
console.log('⚠️  ATTENTION : Ce script va SUPPRIMER TOUTES les données de la base !');
console.log('💾 Assurez-vous d\'avoir sauvegardé ce que vous voulez conserver.');
console.log('🔄 Pour continuer, relancez avec : node clean-database.js --confirm');

if (process.argv.includes('--confirm')) {
  main().catch(console.error);
} else {
  console.log('\n❌ Nettoyage annulé. Utilisez --confirm pour confirmer.');
  process.exit(0);
}
