// Script pour remplir la base de données avec des données de test
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
const Produit = require('./models/Produit');
const Devis = require('./models/Devis');
const Facture = require('./models/Facture');
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

const seedClients = async (admin, user) => {
  try {
    console.log('👥 === CRÉATION DES CLIENTS ===');
    
    // Supprimer les clients existants
    await Client.deleteMany({});
    
    const clients = [
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
        nom: 'Tech Solutions SARL',
        email: 'contact@techsolutions.fr',
        telephone: '04 78 90 12 34',
        adresse: {
          rue: '789 Boulevard de la Croix-Rousse',
          ville: 'Lyon',
          codePostal: '69004',
          pays: 'France'
        },
        createdBy: user._id.toString()
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

const seedDevis = async (admin, user, clients, produits) => {
  try {
    console.log('📋 === CRÉATION DES DEVIS ===');
    
    // Supprimer les devis existants
    await Devis.deleteMany({});
    
    const devis = [
      {
        numero: 'DEV-2025-001',
        client: clients[0]._id,
        dateCreation: new Date('2025-08-01'),
        dateValidite: new Date('2025-09-01'),
        statut: 'envoye',
        lignes: [
          {
            produit: produits[0]._id,
            quantite: 10,
            prixUnitaire: produits[0].prix,
            remise: 0
          },
          {
            produit: produits[3]._id,
            quantite: 50,
            prixUnitaire: produits[3].prix,
            remise: 5
          }
        ],
        remiseGlobale: 0,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Devis pour approvisionnement café et pâtisseries',
        createdBy: admin._id
      },
      {
        numero: 'DEV-2025-002',
        client: clients[2]._id,
        dateCreation: new Date('2025-08-05'),
        dateValidite: new Date('2025-09-05'),
        statut: 'accepte',
        lignes: [
          {
            produit: produits[6]._id,
            quantite: 5,
            prixUnitaire: produits[6].prix,
            remise: 10
          },
          {
            produit: produits[7]._id,
            quantite: 20,
            prixUnitaire: produits[7].prix,
            remise: 0
          }
        ],
        remiseGlobale: 0,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Équipement informatique pour bureau',
        createdBy: user._id
      },
      {
        numero: 'DEV-2025-003',
        client: clients[1]._id,
        dateCreation: new Date('2025-08-10'),
        dateValidite: new Date('2025-09-10'),
        statut: 'refuse',
        lignes: [
          {
            produit: produits[4]._id,
            quantite: 100,
            prixUnitaire: produits[4].prix,
            remise: 0
          }
        ],
        remiseGlobale: 0,
        tva: 10,
        conditions: 'Paiement à 30 jours',
        notes: 'Commande de pain au chocolat refusée',
        createdBy: admin._id
      }
    ];
    
    // Créer et sauvegarder chaque devis (le middleware calculera automatiquement les montants)
    for (const devisData of devis) {
      const devis = new Devis(devisData);
      await devis.save();
      console.log(`✅ Devis créé: ${devis.numero} - ${devis.statut} - Montant TTC: ${devis.montantTTC.toFixed(2)}€`);
    }
    
    console.log(`📊 Total devis créés: ${devis.length}`);
    return devis;
  } catch (error) {
    console.error('❌ Erreur création devis:', error);
    throw error;
  }
};

const seedFactures = async (admin, user, clients, produits, devis) => {
  try {
    console.log('🧾 === CRÉATION DES FACTURES ===');
    
    // Supprimer les factures existantes
    await Facture.deleteMany({});
    
    const factures = [
      {
        numero: 'FACT-2025-001',
        client: clients[0]._id,
        devis: devis[0]._id,
        dateEmission: new Date('2025-08-15'),
        dateEcheance: new Date('2025-09-15'),
        statut: 'payee',
        lignes: [
          {
            produit: produits[0]._id,
            quantite: 10,
            prixUnitaire: produits[0].prix,
            tva: 20
          },
          {
            produit: produits[3]._id,
            quantite: 50,
            prixUnitaire: produits[3].prix,
            tva: 10
          }
        ],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        notes: 'Facture pour approvisionnement café et pâtisseries',
        createdBy: admin._id
      },
      {
        numero: 'FACT-2025-002',
        client: clients[2]._id,
        devis: devis[1]._id,
        dateEmission: new Date('2025-08-20'),
        dateEcheance: new Date('2025-09-20'),
        statut: 'en_attente',
        lignes: [
          {
            produit: produits[6]._id,
            quantite: 5,
            prixUnitaire: produits[6].prix,
            tva: 20
          },
          {
            produit: produits[7]._id,
            quantite: 20,
            prixUnitaire: produits[7].prix,
            tva: 20
          }
        ],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        notes: 'Équipement informatique - Paiement en attente',
        createdBy: user._id
      },
      {
        numero: 'FACT-2025-003',
        client: clients[3]._id,
        devis: null,
        dateEmission: new Date('2025-08-25'),
        dateEcheance: new Date('2025-09-25'),
        statut: 'en_attente',
        lignes: [
          {
            produit: produits[0]._id,
            quantite: 5,
            prixUnitaire: produits[0].prix,
            tva: 20
          },
          {
            produit: produits[3]._id,
            quantite: 25,
            prixUnitaire: produits[3].prix,
            tva: 10
          }
        ],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        notes: 'Commande directe sans devis',
        createdBy: admin._id
      }
    ];
    
    // Calculer les montants pour chaque facture
    for (const factureData of factures) {
      let montantHT = 0;
      let montantTVA = 0;
      
      for (const ligne of factureData.lignes) {
        const sousTotal = ligne.quantite * ligne.prixUnitaire;
        montantHT += sousTotal;
        montantTVA += sousTotal * (ligne.tva / 100);
      }
      
      factureData.montantHT = montantHT;
      factureData.montantTVA = montantTVA;
      factureData.montantTTC = montantHT + montantTVA;
      
      const facture = new Facture(factureData);
      await facture.save();
      console.log(`✅ Facture créée: ${facture.numero} - ${facture.statut}`);
    }
    
    console.log(`📊 Total factures créées: ${factures.length}`);
  } catch (error) {
    console.error('❌ Erreur création factures:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 === DÉMARRAGE DU REMPLISSAGE DE LA BASE ===');
    
    await connectDB();
    
    // Créer les utilisateurs
    const { admin, user } = await seedUsers();
    
    // Créer les produits
    await seedProduits(admin, user);
    
    // Créer les clients
    const clients = await seedClients(admin, user);
    
    // Créer les devis
    const devis = await seedDevis(admin, user, clients, await Produit.find());
    
    // Créer les factures
    await seedFactures(admin, user, clients, await Produit.find(), devis);
    
    console.log('\n🎉 === REMPLISSAGE TERMINÉ AVEC SUCCÈS ===');
    console.log('📊 Résumé :');
    console.log('   👥 2 utilisateurs (admin + user)');
    console.log('   📦 9 produits (café, pâtisserie, électronique)');
    console.log('   👥 4 clients');
    console.log('   📋 3 devis (en cours, validé, refusé)');
    console.log('   🧾 3 factures (payée, en attente)');
    console.log('\n🔑 Comptes de test :');
    console.log('   Admin: admin@factureasy.com / admin123');
    console.log('   User: user@factureasy.com / user123');
    
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
