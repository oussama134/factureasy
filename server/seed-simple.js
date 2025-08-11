// Script simple pour remplir la base de données avec utilisateurs et produits
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Produit = require('./models/Produit');
const bcrypt = require('bcryptjs');

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

const seedUsers = async () => {
  try {
    console.log('👥 === CRÉATION DES UTILISATEURS ===');
    
    // Supprimer les utilisateurs existants
    await User.deleteMany({});
    
    // Créer l'admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@factureasy.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'FactureEasy',
      role: 'admin',
      company: 'FactureEasy Corp'
    });
    await admin.save();
    console.log('✅ Admin créé:', admin.email);
    
    // Créer l'utilisateur
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const user = new User({
      email: 'user@factureasy.com',
      password: hashedUserPassword,
      firstName: 'Utilisateur',
      lastName: 'Test',
      role: 'user',
      company: 'Entreprise Test'
    });
    await user.save();
    console.log('✅ Utilisateur créé:', user.email);
    
    return { admin, user };
  } catch (error) {
    console.error('❌ Erreur création utilisateurs:', error);
    throw error;
  }
};

const seedProduits = async (admin, user) => {
  try {
    console.log('📦 === CRÉATION DES PRODUITS ===');
    
    // Supprimer les produits existants
    await Produit.deleteMany({});
    
    const produits = [
      // Produits Café
      {
        nom: 'Café Arabica Premium',
        description: 'Café arabica de haute qualité, torréfié à la perfection',
        prix: 12.99,
        tva: 20,
        categorie: 'cafe',
        stock: 50,
        unite: 'paquet 250g',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Café Robusta',
        description: 'Café robusta corsé et intense',
        prix: 8.99,
        tva: 20,
        categorie: 'cafe',
        stock: 75,
        unite: 'paquet 250g',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Café Décaféiné',
        description: 'Café sans caféine, goût préservé',
        prix: 14.99,
        tva: 20,
        categorie: 'cafe',
        stock: 30,
        unite: 'paquet 250g',
        createdBy: user._id.toString()
      },
      
      // Produits Pâtisserie
      {
        nom: 'Croissant Classique',
        description: 'Croissant au beurre traditionnel français',
        prix: 2.50,
        tva: 10,
        categorie: 'patisserie',
        stock: 100,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Pain au Chocolat',
        description: 'Pain au chocolat noir premium',
        prix: 2.80,
        tva: 10,
        categorie: 'patisserie',
        stock: 80,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Éclair au Café',
        description: 'Éclair pâtissier avec crème au café',
        prix: 3.20,
        tva: 10,
        categorie: 'patisserie',
        stock: 60,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      
      // Produits Électronique
      {
        nom: 'Ordinateur Portable Pro',
        description: 'Ordinateur portable professionnel haute performance',
        prix: 1299.99,
        tva: 20,
        categorie: 'electronique',
        stock: 15,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Souris Sans Fil',
        description: 'Souris optique sans fil ergonomique',
        prix: 29.99,
        tva: 20,
        categorie: 'electronique',
        stock: 45,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Clavier Mécanique',
        description: 'Clavier mécanique avec switches Cherry MX',
        prix: 89.99,
        tva: 20,
        categorie: 'electronique',
        stock: 25,
        unite: 'pièce',
        createdBy: user._id.toString()
      }
    ];
    
    for (const produitData of produits) {
      const produit = new Produit(produitData);
      await produit.save();
      console.log(`✅ Produit créé: ${produit.nom} (${produit.codeProduit})`);
    }
    
    console.log(`📊 Total produits créés: ${produits.length}`);
  } catch (error) {
    console.error('❌ Erreur création produits:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 === DÉMARRAGE DU REMPLISSAGE SIMPLE ===');
    
    await connectDB();
    
    // Créer les utilisateurs
    const { admin, user } = await seedUsers();
    
    // Créer les produits
    await seedProduits(admin, user);
    
    console.log('\n🎉 === REMPLISSAGE TERMINÉ AVEC SUCCÈS ===');
    console.log('📊 Résumé :');
    console.log('   👥 2 utilisateurs (admin + user)');
    console.log('   📦 9 produits (café, pâtisserie, électronique)');
    console.log('\n🔑 Comptes de test :');
    console.log('   Admin: admin@factureasy.com / admin123');
    console.log('   User: user@factureasy.com / user123');
    console.log('\n💡 Vous pouvez maintenant tester :');
    console.log('   1. La connexion avec les comptes');
    console.log('   2. L\'ajout de nouveaux produits');
    console.log('   3. La gestion des produits existants');
    
  } catch (error) {
    console.error('❌ Erreur lors du remplissage:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

main().catch(console.error);
