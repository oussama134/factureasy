// Script pour ajouter des devis et factures
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

const seedDevis = async (admin, user, produits, clients) => {
  try {
    console.log('📋 === CRÉATION DES DEVIS ===');
    
    // Supprimer les devis existants
    await Devis.deleteMany({});
    
    const devis = [];
    
    // Devis pour Admin (cafés et restaurants)
    const adminClients = clients.filter(c => c.createdBy.toString() === admin._id.toString());
    const adminProduits = produits.filter(p => p.createdBy.toString() === admin._id.toString());
    
    // Devis 1: Café de Paris
    const client1 = adminClients.find(c => c.nom === 'Café de Paris');
    if (client1 && adminProduits.length >= 3) {
      devis.push({
        numero: 'DEV-2024-001',
        client: client1._id,
        dateCreation: new Date('2024-01-15'),
        dateValidite: new Date('2024-02-15'),
        statut: 'envoye',
        lignes: [
          {
            produit: adminProduits[0]._id,
            quantite: 50,
            prixUnitaire: adminProduits[0].prix,
            remise: 5
          },
          {
            produit: adminProduits[1]._id,
            quantite: 30,
            prixUnitaire: adminProduits[1].prix,
            remise: 0
          }
        ],
        remiseGlobale: 10,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Devis pour réapprovisionnement mensuel',
        createdBy: admin._id
      });
    }
    
    // Devis 2: Restaurant Le Gourmet
    const client2 = adminClients.find(c => c.nom === 'Restaurant Le Gourmet');
    if (client2 && adminProduits.length >= 4) {
      devis.push({
        numero: 'DEV-2024-002',
        client: client2._id,
        dateCreation: new Date('2024-01-20'),
        dateValidite: new Date('2024-02-20'),
        statut: 'accepte',
        lignes: [
          {
            produit: adminProduits[2]._id,
            quantite: 25,
            prixUnitaire: adminProduits[2].prix,
            remise: 8
          },
          {
            produit: adminProduits[3]._id,
            quantite: 40,
            prixUnitaire: adminProduits[3].prix,
            remise: 0
          }
        ],
        remiseGlobale: 15,
        tva: 20,
        conditions: 'Paiement à 45 jours',
        notes: 'Commande spéciale pour événement',
        createdBy: admin._id
      });
    }
    
    // Devis 3: Tech Solutions SARL
    const client3 = adminClients.find(c => c.nom === 'Tech Solutions SARL');
    if (client3 && adminProduits.length >= 5) {
      devis.push({
        numero: 'DEV-2024-003',
        client: client3._id,
        dateCreation: new Date('2024-01-25'),
        dateValidite: new Date('2024-03-25'),
        statut: 'brouillon',
        lignes: [
          {
            produit: adminProduits[4]._id,
            quantite: 100,
            prixUnitaire: adminProduits[4].prix,
            remise: 12
          }
        ],
        remiseGlobale: 20,
        tva: 20,
        conditions: 'Paiement à 60 jours',
        notes: 'Devis en cours de négociation',
        createdBy: admin._id
      });
    }
    
    // Devis pour User (boutiques)
    const userClients = clients.filter(c => c.createdBy.toString() === user._id.toString());
    const userProduits = produits.filter(p => p.createdBy.toString() === user._id.toString());
    
    // Devis 4: Boutique Mode Élégance
    const client4 = userClients.find(c => c.nom === 'Boutique Mode Élégance');
    if (client4 && userProduits.length >= 2) {
      devis.push({
        numero: 'DEV-2024-004',
        client: client4._id,
        dateCreation: new Date('2024-01-18'),
        dateValidite: new Date('2024-02-18'),
        statut: 'envoye',
        lignes: [
          {
            produit: userProduits[0]._id,
            quantite: 20,
            prixUnitaire: userProduits[0].prix,
            remise: 0
          },
          {
            produit: userProduits[1]._id,
            quantite: 15,
            prixUnitaire: userProduits[1].prix,
            remise: 5
          }
        ],
        remiseGlobale: 8,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Collection printemps-été',
        createdBy: user._id
      });
    }
    
    // Devis 5: Librairie du Savoir
    const client5 = userClients.find(c => c.nom === 'Librairie du Savoir');
    if (client5 && userProduits.length >= 3) {
      devis.push({
        numero: 'DEV-2024-005',
        client: client5._id,
        dateCreation: new Date('2024-01-22'),
        dateValidite: new Date('2024-02-22'),
        statut: 'accepte',
        lignes: [
          {
            produit: userProduits[2]._id,
            quantite: 50,
            prixUnitaire: userProduits[2].prix,
            remise: 10
          }
        ],
        remiseGlobale: 0,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Commande confirmée',
        createdBy: user._id
      });
    }
    
    // Créer tous les devis
    for (const devisData of devis) {
      const devis = new Devis(devisData);
      await devis.save();
      console.log(`✅ Devis créé: ${devis.numero} - ${devisData.client ? 'Client trouvé' : 'Client manquant'}`);
    }
    
    console.log(`📊 Total devis créés: ${devis.length}`);
    return devis;
    
  } catch (error) {
    console.error('❌ Erreur création devis:', error);
    throw error;
  }
};

const seedFactures = async (admin, user, produits, clients, devis) => {
  try {
    console.log('🧾 === CRÉATION DES FACTURES ===');
    
    // Supprimer les factures existantes
    await Facture.deleteMany({});
    
    const factures = [];
    
    // Factures pour Admin
    const adminClients = clients.filter(c => c.createdBy.toString() === admin._id.toString());
    const adminProduits = produits.filter(p => p.createdBy.toString() === admin._id.toString());
    
    // Facture 1: Café de Paris (basée sur devis accepté)
    const client1 = adminClients.find(c => c.nom === 'Café de Paris');
    if (client1 && adminProduits.length >= 2) {
      factures.push({
        numero: 'FAC-2024-001',
        client: client1._id,
        dateCreation: new Date('2024-01-15'),
        dateEcheance: new Date('2024-02-15'),
        statut: 'envoye',
        lignes: [
          {
            produit: adminProduits[0]._id,
            quantite: 50,
            prixUnitaire: adminProduits[0].prix,
            remise: 5
          },
          {
            produit: adminProduits[1]._id,
            quantite: 30,
            prixUnitaire: adminProduits[1].prix,
            remise: 0
          }
        ],
        remiseGlobale: 10,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Facture basée sur devis DEV-2024-001',
        createdBy: admin._id
      });
    }
    
    // Facture 2: Restaurant Le Gourmet (payée)
    const client2 = adminClients.find(c => c.nom === 'Restaurant Le Gourmet');
    if (client2 && adminProduits.length >= 2) {
      factures.push({
        numero: 'FAC-2024-002',
        client: client2._id,
        dateCreation: new Date('2024-01-20'),
        dateEcheance: new Date('2024-03-06'),
        statut: 'payee',
        lignes: [
          {
            produit: adminProduits[2]._id,
            quantite: 25,
            prixUnitaire: adminProduits[2].prix,
            remise: 8
          },
          {
            produit: adminProduits[3]._id,
            quantite: 40,
            prixUnitaire: adminProduits[3].prix,
            remise: 0
          }
        ],
        remiseGlobale: 15,
        tva: 20,
        conditions: 'Paiement à 45 jours',
        notes: 'Paiement reçu le 06/03/2024',
        datePaiement: new Date('2024-03-06'),
        createdBy: admin._id
      });
    }
    
    // Facture 3: Tech Solutions SARL
    const client3 = adminClients.find(c => c.nom === 'Tech Solutions SARL');
    if (client3 && adminProduits.length >= 1) {
      factures.push({
        numero: 'FAC-2024-003',
        client: client3._id,
        dateCreation: new Date('2024-01-25'),
        dateEcheance: new Date('2024-03-25'),
        statut: 'envoye',
        lignes: [
          {
            produit: adminProduits[4]._id,
            quantite: 100,
            prixUnitaire: adminProduits[4].prix,
            remise: 12
          }
        ],
        remiseGlobale: 20,
        tva: 20,
        conditions: 'Paiement à 60 jours',
        notes: 'Facture en attente de paiement',
        createdBy: admin._id
      });
    }
    
    // Factures pour User
    const userClients = clients.filter(c => c.createdBy.toString() === user._id.toString());
    const userProduits = produits.filter(p => p.createdBy.toString() === user._id.toString());
    
    // Facture 4: Boutique Mode Élégance
    const client4 = userClients.find(c => c.nom === 'Boutique Mode Élégance');
    if (client4 && userProduits.length >= 2) {
      factures.push({
        numero: 'FAC-2024-004',
        client: client4._id,
        dateCreation: new Date('2024-01-18'),
        dateEcheance: new Date('2024-02-18'),
        statut: 'envoye',
        lignes: [
          {
            produit: userProduits[0]._id,
            quantite: 20,
            prixUnitaire: userProduits[0].prix,
            remise: 0
          },
          {
            produit: userProduits[1]._id,
            quantite: 15,
            prixUnitaire: userProduits[1].prix,
            remise: 5
          }
        ],
        remiseGlobale: 8,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Collection printemps-été',
        createdBy: user._id
      });
    }
    
    // Facture 5: Librairie du Savoir (payée)
    const client5 = userClients.find(c => c.nom === 'Librairie du Savoir');
    if (client5 && userProduits.length >= 1) {
      factures.push({
        numero: 'FAC-2024-005',
        client: client5._id,
        dateCreation: new Date('2024-01-22'),
        dateEcheance: new Date('2024-02-22'),
        statut: 'payee',
        lignes: [
          {
            produit: userProduits[2]._id,
            quantite: 50,
            prixUnitaire: userProduits[2].prix,
            remise: 10
          }
        ],
        remiseGlobale: 0,
        tva: 20,
        conditions: 'Paiement à 30 jours',
        notes: 'Paiement reçu le 22/02/2024',
        datePaiement: new Date('2024-02-22'),
        createdBy: user._id
      });
    }
    
    // Créer toutes les factures
    for (const factureData of factures) {
      const facture = new Facture(factureData);
      await facture.save();
      console.log(`✅ Facture créée: ${facture.numero} - ${factureData.client ? 'Client trouvé' : 'Client manquant'}`);
    }
    
    console.log(`📊 Total factures créées: ${factures.length}`);
    return factures;
    
  } catch (error) {
    console.error('❌ Erreur création factures:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 === DÉMARRAGE DU REMPLISSAGE DEVIS ET FACTURES ===');
    
    await connectDB();
    
    // Récupérer les utilisateurs, produits et clients existants
    const admin = await User.findOne({ email: 'admin@factureasy.com' });
    const user = await User.findOne({ email: 'user@factureasy.com' });
    
    if (!admin || !user) {
      throw new Error('❌ Utilisateurs admin ou user non trouvés');
    }
    
    const produits = await Produit.find({});
    const clients = await Client.find({});
    
    if (produits.length === 0 || clients.length === 0) {
      throw new Error('❌ Aucun produit ou client trouvé. Exécutez d\'abord seed-database.js');
    }
    
    console.log(`📦 Produits trouvés: ${produits.length}`);
    console.log(`👥 Clients trouvés: ${clients.length}`);
    
    // Créer les devis et factures
    const devis = await seedDevis(admin, user, produits, clients);
    const factures = await seedFactures(admin, user, produits, clients, devis);
    
    console.log('\n🎉 === REMPLISSAGE DEVIS ET FACTURES TERMINÉ ===');
    console.log('📊 Résumé complet :');
    console.log(`   📋 ${devis.length} devis créés`);
    console.log(`   🧾 ${factures.length} factures créées`);
    console.log('\n💡 Répartition par utilisateur :');
    console.log('   🏢 Admin : devis et factures pour cafés, restaurants et entreprises');
    console.log('   👤 User : devis et factures pour boutiques et librairies');
    console.log('\n🚀 Testez maintenant toutes les fonctionnalités !');
    console.log('   ✅ Gestion des devis (création, modification, statuts)');
    console.log('   ✅ Gestion des factures (création, paiement, échéances)');
    console.log('   ✅ Calculs automatiques (sous-totaux, TVA, remises)');
    console.log('   ✅ Relations entre devis et factures');
    
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
