// Script basique pour remplir la base de données avec utilisateurs, produits et clients
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Produit = require('./models/Produit');
const Client = require('./models/Client');
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
      // Produits Café (Admin)
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
        createdBy: admin._id.toString()
      },
      {
        nom: 'Café Colombien',
        description: 'Café colombien doux et équilibré',
        prix: 16.99,
        tva: 20,
        categorie: 'cafe',
        stock: 40,
        unite: 'paquet 250g',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Café Éthiopien',
        description: 'Café éthiopien aux notes florales',
        prix: 18.99,
        tva: 20,
        categorie: 'cafe',
        stock: 25,
        unite: 'paquet 250g',
        createdBy: admin._id.toString()
      },
      
      // Produits Pâtisserie (Admin)
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
        createdBy: admin._id.toString()
      },
      {
        nom: 'Tarte Tatin',
        description: 'Tarte tatin traditionnelle aux pommes',
        prix: 4.50,
        tva: 10,
        categorie: 'patisserie',
        stock: 45,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Mille-Feuille',
        description: 'Mille-feuille à la vanille bourbon',
        prix: 5.20,
        tva: 10,
        categorie: 'patisserie',
        stock: 35,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      
      // Produits Électronique (Admin)
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
        createdBy: admin._id.toString()
      },
      {
        nom: 'Écran 4K 27"',
        description: 'Écran 4K professionnel pour graphistes',
        prix: 399.99,
        tva: 20,
        categorie: 'electronique',
        stock: 20,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      {
        nom: 'Disque Dur SSD 1TB',
        description: 'Disque dur SSD haute performance',
        prix: 79.99,
        tva: 20,
        categorie: 'electronique',
        stock: 60,
        unite: 'pièce',
        createdBy: admin._id.toString()
      },
      
      // Produits Vêtements (User)
      {
        nom: 'T-Shirt Premium',
        description: 'T-shirt en coton bio de haute qualité',
        prix: 24.99,
        tva: 20,
        categorie: 'vetements',
        stock: 120,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      {
        nom: 'Jean Slim Fit',
        description: 'Jean slim fit en denim stretch',
        prix: 59.99,
        tva: 20,
        categorie: 'vetements',
        stock: 80,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      {
        nom: 'Pull en Laine',
        description: 'Pull en laine mérinos douce',
        prix: 89.99,
        tva: 20,
        categorie: 'vetements',
        stock: 45,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      {
        nom: 'Veste Cuir',
        description: 'Veste en cuir véritable vintage',
        prix: 199.99,
        tva: 20,
        categorie: 'vetements',
        stock: 25,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      
      // Produits Livres (User)
      {
        nom: 'Roman Bestseller',
        description: 'Roman à succès en édition limitée',
        prix: 19.99,
        tva: 5.5,
        categorie: 'livres',
        stock: 200,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      {
        nom: 'Livre Cuisine',
        description: 'Livre de recettes gastronomiques',
        prix: 34.99,
        tva: 5.5,
        categorie: 'livres',
        stock: 75,
        unite: 'pièce',
        createdBy: user._id.toString()
      },
      {
        nom: 'Guide Voyage',
        description: 'Guide de voyage complet et illustré',
        prix: 22.99,
        tva: 5.5,
        categorie: 'livres',
        stock: 90,
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
    return produits;
  } catch (error) {
    console.error('❌ Erreur création produits:', error);
    throw error;
  }
};

const seedClients = async (admin, user) => {
  try {
    console.log('👥 === CRÉATION DES CLIENTS ===');
    
    // Supprimer les clients existants
    await Client.deleteMany({});
    
    const clients = [
      // Clients Admin - Cafés et Restaurants
      {
        nom: 'Café de Paris',
        email: 'contact@cafedeparis.fr',
        telephone: '01 42 86 12 34',
        adresse: {
          rue: '123 Avenue des Champs-Élysées',
          ville: 'Paris',
          codePostal: '75008',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Boulangerie Traditionnelle',
        email: 'info@boulangerie-trad.fr',
        telephone: '01 45 67 89 12',
        adresse: {
          rue: '456 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75002',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Restaurant Le Gourmet',
        email: 'reservation@legourmet.fr',
        telephone: '02 40 12 34 56',
        adresse: {
          rue: '321 Quai de la Fosse',
          ville: 'Nantes',
          codePostal: '44000',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Café Central Lyon',
        email: 'contact@cafecentral-lyon.fr',
        telephone: '04 78 90 12 34',
        adresse: {
          rue: '789 Boulevard de la Croix-Rousse',
          ville: 'Lyon',
          codePostal: '69004',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Pâtisserie du Sud',
        email: 'info@patisserie-sud.fr',
        telephone: '05 61 23 45 67',
        adresse: {
          rue: '456 Rue de la République',
          ville: 'Toulouse',
          codePostal: '31000',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Restaurant La Mer',
        email: 'contact@restaurant-lamer.fr',
        telephone: '04 94 56 78 90',
        adresse: {
          rue: '789 Promenade des Anglais',
          ville: 'Nice',
          codePostal: '06000',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      
      // Clients Admin - Entreprises
      {
        nom: 'Tech Solutions SARL',
        email: 'contact@techsolutions.fr',
        telephone: '04 78 90 12 34',
        adresse: {
          rue: '123 Rue de l\'Innovation',
          ville: 'Lyon',
          codePostal: '69002',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Design Studio Pro',
        email: 'hello@designstudio.fr',
        telephone: '01 23 45 67 89',
        adresse: {
          rue: '456 Avenue des Arts',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      {
        nom: 'Marketing Digital Plus',
        email: 'contact@marketingdigital.fr',
        telephone: '05 67 89 01 23',
        adresse: {
          rue: '789 Boulevard du Digital',
          ville: 'Bordeaux',
          codePostal: '33000',
          pays: 'France'
        },
        createdBy: admin._id.toString()
      },
      
      // Clients User - Boutiques
      {
        nom: 'Boutique Mode Élégance',
        email: 'contact@mode-elegance.fr',
        telephone: '01 98 76 54 32',
        adresse: {
          rue: '321 Rue de la Mode',
          ville: 'Paris',
          codePostal: '75016',
          pays: 'France'
        },
        createdBy: user._id.toString()
      },
      {
        nom: 'Librairie du Savoir',
        email: 'info@librairie-savoir.fr',
        telephone: '04 56 78 90 12',
        adresse: {
          rue: '654 Rue des Livres',
          ville: 'Grenoble',
          codePostal: '38000',
          pays: 'France'
        },
        createdBy: user._id.toString()
      },
      {
        nom: 'Accessoires Chic',
        email: 'contact@accessoires-chic.fr',
        telephone: '02 34 56 78 90',
        adresse: {
          rue: '987 Rue des Accessoires',
          ville: 'Rennes',
          codePostal: '35000',
          pays: 'France'
        },
        createdBy: user._id.toString()
      },
      {
        nom: 'Shoes & Co',
        email: 'hello@shoes-co.fr',
        telephone: '03 45 67 89 01',
        adresse: {
          rue: '147 Rue de la Chaussure',
          ville: 'Lille',
          codePostal: '59000',
          pays: 'France'
        },
        createdBy: user._id.toString()
      },
      {
        nom: 'Bijoux Précieux',
        email: 'contact@bijoux-precieux.fr',
        telephone: '04 67 89 01 23',
        adresse: {
          rue: '258 Rue des Bijoux',
          ville: 'Annecy',
          codePostal: '74000',
          pays: 'France'
        },
        createdBy: user._id.toString()
      }
    ];
    
    for (const clientData of clients) {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Client créé: ${client.nom}`);
    }
    
    console.log(`📊 Total clients créés: ${clients.length}`);
    return clients;
  } catch (error) {
    console.error('❌ Erreur création clients:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 === DÉMARRAGE DU REMPLISSAGE BASIQUE ===');
    
    await connectDB();
    
    // Créer les utilisateurs
    const { admin, user } = await seedUsers();
    
    // Créer les produits
    const produits = await seedProduits(admin, user);
    
    // Créer les clients
    const clients = await seedClients(admin, user);
    
    console.log('\n🎉 === REMPLISSAGE TERMINÉ AVEC SUCCÈS ===');
    console.log('📊 Résumé complet :');
    console.log('   👥 2 utilisateurs (admin + user)');
    console.log('   📦 22 produits (café, pâtisserie, électronique, vêtements, livres)');
    console.log('   👥 14 clients (9 admin + 5 user)');
    console.log('\n🔑 Comptes de test :');
    console.log('   Admin: admin@factureasy.com / admin123');
    console.log('   User: user@factureasy.com / user123');
    console.log('\n💡 Données créées :');
    console.log('   🏢 Admin : 6 clients cafés/restaurants + 3 entreprises + 17 produits');
    console.log('   👤 User : 5 clients boutiques + 5 produits');
    console.log('\n🚀 Testez maintenant toutes les fonctionnalités !');
    console.log('   ✅ Connexion et authentification');
    console.log('   ✅ Gestion des produits (ajout, modification, suppression)');
    console.log('   ✅ Gestion des clients (ajout, modification, suppression)');
    console.log('   ✅ Création de devis et factures manuellement');
    
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
