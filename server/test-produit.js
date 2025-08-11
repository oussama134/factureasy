// Script de test pour vérifier l'ajout de produit
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Produit = require('./models/Produit');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy';
    console.log('🔍 === CONNEXION MONGODB ===');
    console.log('🔍 URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connecté à MongoDB avec succès');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  }
};

const testProduitCreation = async () => {
  try {
    console.log('🧪 === TEST CRÉATION PRODUIT ===');
    
    // Test 1: Produit avec codeProduit vide
    console.log('📝 Test 1: Produit avec codeProduit vide...');
    const produit1 = new Produit({
      nom: 'Test Produit 1',
      prix: 25.99,
      description: 'Produit de test sans code',
      tva: 20,
      categorie: 'cafe',
      createdBy: 'test-user-1'
    });
    
    await produit1.save();
    console.log('✅ Produit 1 créé avec succès');
    console.log(`   Code généré: ${produit1.codeProduit}`);
    
    // Test 2: Produit avec codeProduit personnalisé
    console.log('📝 Test 2: Produit avec codeProduit personnalisé...');
    const produit2 = new Produit({
      nom: 'Test Produit 2',
      prix: 15.50,
      description: 'Produit de test avec code personnalisé',
      tva: 10,
      categorie: 'patisserie',
      codeProduit: 'PAT-CUSTOM-001',
      createdBy: 'test-user-2'
    });
    
    await produit2.save();
    console.log('✅ Produit 2 créé avec succès');
    console.log(`   Code utilisé: ${produit2.codeProduit}`);
    
    // Test 3: Produit avec codeProduit null
    console.log('📝 Test 3: Produit avec codeProduit null...');
    const produit3 = new Produit({
      nom: 'Test Produit 3',
      prix: 99.99,
      description: 'Produit de test avec code null',
      tva: 20,
      categorie: 'electronique',
      codeProduit: null,
      createdBy: 'test-user-3'
    });
    
    await produit3.save();
    console.log('✅ Produit 3 créé avec succès');
    console.log(`   Code généré: ${produit3.codeProduit}`);
    
    // Vérifier que tous les produits ont des codes uniques
    const allProduits = await Produit.find({});
    console.log('\n📊 === VÉRIFICATION DES CODES ===');
    allProduits.forEach(produit => {
      console.log(`   - ${produit.nom}: ${produit.codeProduit}`);
    });
    
    // Vérifier qu'il n'y a pas de doublons
    const codes = allProduits.map(p => p.codeProduit);
    const uniqueCodes = new Set(codes);
    
    if (codes.length === uniqueCodes.size) {
      console.log('✅ Tous les codes sont uniques !');
    } else {
      console.log('❌ Il y a des codes en double !');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.code === 11000) {
      console.log('💡 Erreur de doublon détectée');
      console.log('   Détails:', error.message);
    }
  }
};

const cleanupTestProduits = async () => {
  try {
    console.log('\n🧹 === NETTOYAGE DES PRODUITS DE TEST ===');
    
    const result = await Produit.deleteMany({
      nom: { $regex: /^Test Produit/ }
    });
    
    console.log(`🗑️ ${result.deletedCount} produits de test supprimés`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

const main = async () => {
  await connectDB();
  await testProduitCreation();
  await cleanupTestProduits();
  
  console.log('\n🏁 Test terminé');
  process.exit(0);
};

main().catch(console.error);
