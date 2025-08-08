const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Client = require('./models/Client');
const Produit = require('./models/Produit');
require('dotenv').config({ path: './config.env' });

console.log('🚀 Initialisation de la base de données de production...');

const initializeProductionDatabase = async () => {
  try {
    // Connexion à MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://furboooussama10:Jt6Vi-932nb$DxU@cluster0.adro0.mongodb.net/factureasy?retryWrites=true&w=majority&appName=Cluster0';
    console.log('🔍 Connexion à MongoDB Atlas...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB Atlas');

    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('⚠️ Des utilisateurs existent déjà dans la base de données');
      console.log('📊 Utilisateurs trouvés:', existingUsers.map(u => ({ email: u.email, role: u.role })));
      return;
    }

    // Suppression des données existantes
    await User.deleteMany({});
    await Client.deleteMany({});
    await Produit.deleteMany({});
    console.log('🗑️ Base de données nettoyée');

    // Création des utilisateurs de test
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const adminUser = new User({
      email: 'admin@factureasy.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'FactureEasy',
      role: 'admin',
      company: 'FactureEasy'
    });

    const regularUser = new User({
      email: 'user@factureasy.com',
      password: hashedUserPassword,
      firstName: 'Utilisateur',
      lastName: 'Test',
      role: 'user',
      company: 'Entreprise Test'
    });

    await adminUser.save();
    await regularUser.save();
    console.log('✅ Utilisateurs créés avec succès');

    // Création de données de test pour l'admin
    const adminClients = [
      {
        nom: 'Entreprise ABC',
        email: 'contact@abc.com',
        telephone: '0123456789',
        adresse: {
          rue: '123 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France'
        },
        createdBy: adminUser._id.toString()
      },
      {
        nom: 'Société XYZ',
        email: 'info@xyz.com',
        telephone: '0987654321',
        adresse: {
          rue: '456 Avenue des Champs',
          ville: 'Lyon',
          codePostal: '69001',
          pays: 'France'
        },
        createdBy: adminUser._id.toString()
      }
    ];

    const adminProduits = [
      {
        nom: 'Service de consultation',
        description: 'Consultation professionnelle',
        prix: 150,
        categorie: 'Service',
        createdBy: adminUser._id.toString()
      },
      {
        nom: 'Développement web',
        description: 'Création de site web',
        prix: 500,
        categorie: 'Service',
        createdBy: adminUser._id.toString()
      }
    ];

    await Client.insertMany(adminClients);
    await Produit.insertMany(adminProduits);
    console.log('✅ Données de test créées pour l\'admin');

    // Création de données de test pour l'utilisateur
    const userClients = [
      {
        nom: 'Client Personnel',
        email: 'client@test.com',
        telephone: '0555666777',
        adresse: {
          rue: '789 Boulevard Central',
          ville: 'Marseille',
          codePostal: '13001',
          pays: 'France'
        },
        createdBy: regularUser._id.toString()
      }
    ];

    const userProduits = [
      {
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: 75,
        categorie: 'Produit',
        createdBy: regularUser._id.toString()
      }
    ];

    await Client.insertMany(userClients);
    await Produit.insertMany(userProduits);
    console.log('✅ Données de test créées pour l\'utilisateur');

    console.log('🎉 Base de données de production initialisée avec succès !');
    console.log('\n📋 Comptes de test créés :');
    console.log('👑 Admin: admin@factureasy.com / admin123');
    console.log('👤 User: user@factureasy.com / user123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

// Exécuter le script
initializeProductionDatabase();
