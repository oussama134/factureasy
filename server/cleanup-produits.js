// Script pour nettoyer la base de données des produits avec codeProduit null
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

const cleanupProduits = async () => {
  try {
    console.log('🧹 === NETTOYAGE DES PRODUITS ===');
    
    // Trouver tous les produits avec codeProduit null ou undefined
    const produitsNull = await Produit.find({
      $or: [
        { codeProduit: null },
        { codeProduit: undefined },
        { codeProduit: '' }
      ]
    });
    
    console.log(`📊 Produits trouvés avec codeProduit problématique: ${produitsNull.length}`);
    
    if (produitsNull.length === 0) {
      console.log('✅ Aucun produit à nettoyer');
      return;
    }
    
    // Afficher les produits problématiques
    produitsNull.forEach(produit => {
      console.log(`   - ${produit.nom} (ID: ${produit._id}) - codeProduit: ${produit.codeProduit}`);
    });
    
    // Supprimer les produits problématiques
    const result = await Produit.deleteMany({
      $or: [
        { codeProduit: null },
        { codeProduit: undefined },
        { codeProduit: '' }
      ]
    });
    
    console.log(`🗑️ ${result.deletedCount} produits supprimés avec succès`);
    
    // Vérifier qu'il n'y a plus de produits problématiques
    const remainingNull = await Produit.find({
      $or: [
        { codeProduit: null },
        { codeProduit: undefined },
        { codeProduit: '' }
      ]
    });
    
    if (remainingNull.length === 0) {
      console.log('✅ Base de données nettoyée avec succès');
    } else {
      console.log(`⚠️ Il reste ${remainingNull.length} produits problématiques`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

const main = async () => {
  await connectDB();
  await cleanupProduits();
  
  console.log('🏁 Nettoyage terminé');
  process.exit(0);
};

main().catch(console.error);
