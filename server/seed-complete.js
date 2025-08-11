// Script complet pour remplir toute la base de données
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Produit = require('./models/Produit');
const Client = require('./models/Client');
const Devis = require('./models/Devis');
const Facture = require('./models/Facture');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connecté à MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    console.log('👤 === CRÉATION DES UTILISATEURS ===');
    
    // Supprimer les utilisateurs existants
    await User.deleteMany({});
    
    // Créer l'admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      email: 'admin@factureasy.com',
      password: hashedAdminPassword,
      nom: 'Administrateur',
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Admin créé: admin@factureasy.com / admin123');
    
    // Créer l'utilisateur
    const hashedUserPassword = await bcrypt.hash('user123', 12);
    const user = new User({
      email: 'user@factureasy.com',
      password: hashedUserPassword,
      nom: 'Utilisateur Test',
      role: 'user'
    });
    await user.save();
    console.log('✅ User créé: user@factureasy.com / user123');
    
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
    
    const produits = [];
    
    // Produits Admin - Cafés et Pâtisseries
    const produitsAdmin = [
      { nom: 'Café Arabica Premium', prix: 12.50, categorie: 'Café', description: 'Café arabica de haute qualité, torréfié à la perfection', tva: 20, createdBy: admin._id },
      { nom: 'Café Robusta Fort', prix: 9.80, categorie: 'Café', description: 'Café robusta corsé et intense', tva: 20, createdBy: admin._id },
      { nom: 'Café Décaféiné', prix: 14.20, categorie: 'Café', description: 'Café sans caféine, goût préservé', tva: 20, createdBy: admin._id },
      { nom: 'Café Bio Équitable', prix: 16.90, categorie: 'Café', description: 'Café biologique et commerce équitable', tva: 20, createdBy: admin._id },
      { nom: 'Croissant Classique', prix: 1.20, categorie: 'Pâtisserie', description: 'Croissant au beurre traditionnel', tva: 20, createdBy: admin._id },
      { nom: 'Pain au Chocolat', prix: 1.40, categorie: 'Pâtisserie', description: 'Pain au chocolat gourmand', tva: 20, createdBy: admin._id },
      { nom: 'Éclair au Café', prix: 2.80, categorie: 'Pâtisserie', description: 'Éclair fourré au café', tva: 20, createdBy: admin._id },
      { nom: 'Tarte Tatin', prix: 3.50, categorie: 'Pâtisserie', description: 'Tarte tatin traditionnelle', tva: 20, createdBy: admin._id },
      { nom: 'Macaron Vanille', prix: 1.80, categorie: 'Pâtisserie', description: 'Macaron à la vanille de Madagascar', tva: 20, createdBy: admin._id },
      { nom: 'Mille-feuille', prix: 4.20, categorie: 'Pâtisserie', description: 'Mille-feuille classique', tva: 20, createdBy: admin._id },
      { nom: 'Chausson aux Pommes', prix: 1.60, categorie: 'Pâtisserie', description: 'Chausson aux pommes traditionnel', tva: 20, createdBy: admin._id },
      { nom: 'Pain aux Raisins', prix: 1.30, categorie: 'Pâtisserie', description: 'Pain aux raisins et crème pâtissière', tva: 20, createdBy: admin._id },
      { nom: 'Brioche Nanterre', prix: 2.10, categorie: 'Pâtisserie', description: 'Brioche nanterre moelleuse', tva: 20, createdBy: admin._id },
      { nom: 'Chouquettes', prix: 0.80, categorie: 'Pâtisserie', description: 'Chouquettes saupoudrées de sucre', tva: 20, createdBy: admin._id },
      { nom: 'Financier Amande', prix: 1.90, categorie: 'Pâtisserie', description: 'Financier aux amandes', tva: 20, createdBy: admin._id },
      { nom: 'Madeleine', prix: 0.70, categorie: 'Pâtisserie', description: 'Madeleine traditionnelle', tva: 20, createdBy: admin._id },
      { nom: 'Palmier', prix: 1.10, categorie: 'Pâtisserie', description: 'Palmier feuilleté', tva: 20, createdBy: admin._id }
    ];
    
    // Produits User - Électronique, Vêtements, Livres
    const produitsUser = [
      { nom: 'Smartphone Galaxy S24', prix: 899.99, categorie: 'Électronique', description: 'Smartphone Android dernière génération', tva: 20, createdBy: user._id },
      { nom: 'Laptop HP Pavilion', prix: 649.99, categorie: 'Électronique', description: 'Ordinateur portable polyvalent', tva: 20, createdBy: user._id },
      { nom: 'T-shirt Premium', prix: 29.99, categorie: 'Vêtements', description: 'T-shirt en coton bio de qualité', tva: 20, createdBy: user._id },
      { nom: 'Jeans Slim Fit', prix: 79.99, categorie: 'Vêtements', description: 'Jeans moderne et confortable', tva: 20, createdBy: user._id },
      { nom: 'Livre "Le Petit Prince"', prix: 12.99, categorie: 'Livres', description: 'Édition collector du classique', tva: 20, createdBy: user._id }
    ];
    
    // Créer tous les produits
    for (const produitData of [...produitsAdmin, ...produitsUser]) {
      const produit = new Produit(produitData);
      await produit.save();
      produits.push(produit);
      console.log(`✅ Produit créé: ${produit.nom} (${produit.categorie})`);
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
      { nom: 'Café de Paris', email: 'contact@cafedeparis.fr', telephone: '01 42 86 12 34', adresse: { rue: '123 Avenue des Champs-Élysées', ville: 'Paris', codePostal: '75008', pays: 'France' }, createdBy: admin._id },
      { nom: 'Boulangerie Traditionnelle', email: 'info@boulangerie-trad.fr', telephone: '01 45 67 89 12', adresse: { rue: '456 Rue de la Paix', ville: 'Paris', codePostal: '75002', pays: 'France' }, createdBy: admin._id },
      { nom: 'Restaurant Le Gourmet', email: 'reservation@legourmet.fr', telephone: '02 40 12 34 56', adresse: { rue: '321 Quai de la Fosse', ville: 'Nantes', codePostal: '44000', pays: 'France' }, createdBy: admin._id },
      { nom: 'Café Central Lyon', email: 'contact@cafecentral-lyon.fr', telephone: '04 78 90 12 34', adresse: { rue: '789 Boulevard de la Croix-Rousse', ville: 'Lyon', codePostal: '69004', pays: 'France' }, createdBy: admin._id },
      { nom: 'Pâtisserie du Sud', email: 'info@patisserie-sud.fr', telephone: '05 61 23 45 67', adresse: { rue: '456 Rue de la République', ville: 'Toulouse', codePostal: '31000', pays: 'France' }, createdBy: admin._id },
      { nom: 'Restaurant La Mer', email: 'contact@restaurant-lamer.fr', telephone: '04 94 56 78 90', adresse: { rue: '789 Promenade des Anglais', ville: 'Nice', codePostal: '06000', pays: 'France' }, createdBy: admin._id },
      // Clients Admin - Entreprises
      { nom: 'Tech Solutions SARL', email: 'contact@techsolutions.fr', telephone: '04 78 90 12 34', adresse: { rue: '123 Rue de l\'Innovation', ville: 'Lyon', codePostal: '69002', pays: 'France' }, createdBy: admin._id },
      { nom: 'Design Studio Pro', email: 'hello@designstudio.fr', telephone: '01 23 45 67 89', adresse: { rue: '456 Avenue des Arts', ville: 'Paris', codePostal: '75001', pays: 'France' }, createdBy: admin._id },
      { nom: 'Marketing Digital Plus', email: 'contact@marketingdigital.fr', telephone: '05 67 89 01 23', adresse: { rue: '789 Boulevard du Digital', ville: 'Bordeaux', codePostal: '33000', pays: 'France' }, createdBy: admin._id },
      // Clients User - Boutiques
      { nom: 'Boutique Mode Élégance', email: 'contact@mode-elegance.fr', telephone: '01 98 76 54 32', adresse: { rue: '321 Rue de la Mode', ville: 'Paris', codePostal: '75016', pays: 'France' }, createdBy: user._id },
      { nom: 'Librairie du Savoir', email: 'info@librairie-savoir.fr', telephone: '04 56 78 90 12', adresse: { rue: '654 Rue des Livres', ville: 'Grenoble', codePostal: '38000', pays: 'France' }, createdBy: user._id },
      { nom: 'Accessoires Chic', email: 'contact@accessoires-chic.fr', telephone: '02 34 56 78 90', adresse: { rue: '987 Rue des Accessoires', ville: 'Rennes', codePostal: '35000', pays: 'France' }, createdBy: user._id },
      { nom: 'Shoes & Co', email: 'hello@shoes-co.fr', telephone: '03 45 67 89 01', adresse: { rue: '147 Rue de la Chaussure', ville: 'Lille', codePostal: '59000', pays: 'France' }, createdBy: user._id },
      { nom: 'Bijoux Précieux', email: 'contact@bijoux-precieux.fr', telephone: '04 67 89 01 23', adresse: { rue: '258 Rue des Bijoux', ville: 'Annecy', codePostal: '74000', pays: 'France' }, createdBy: user._id }
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
    console.log('🚀 === DÉMARRAGE DU REMPLISSAGE COMPLET ===');
    
    await connectDB();
    
    // Créer tout dans l'ordre
    const { admin, user } = await seedUsers();
    const produits = await seedProduits(admin, user);
    const clients = await seedClients(admin, user);
    const devis = await seedDevis(admin, user, produits, clients);
    const factures = await seedFactures(admin, user, produits, clients, devis);
    
    console.log('\n🎉 === REMPLISSAGE COMPLET TERMINÉ AVEC SUCCÈS ===');
    console.log('📊 Résumé complet :');
    console.log('   👤 2 utilisateurs (admin + user)');
    console.log('   📦 22 produits (café, pâtisserie, électronique, vêtements, livres)');
    console.log('   👥 14 clients (9 admin + 5 user)');
    console.log('   📋 5 devis (3 admin + 2 user)');
    console.log('   🧾 5 factures (3 admin + 2 user)');
    console.log('\n🔑 Comptes de test :');
    console.log('   Admin: admin@factureasy.com / admin123');
    console.log('   User: user@factureasy.com / user123');
    console.log('\n💡 Données créées :');
    console.log('   🏢 Admin : 9 clients + 17 produits + 3 devis + 3 factures');
    console.log('   👤 User : 5 clients + 5 produits + 2 devis + 2 factures');
    console.log('\n🚀 Testez maintenant toutes les fonctionnalités !');
    console.log('   ✅ Connexion et authentification');
    console.log('   ✅ Gestion des produits (ajout, modification, suppression)');
    console.log('   ✅ Gestion des clients (ajout, modification, suppression)');
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
