// Script de vérification de la base de données
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

const verifyDatabase = async () => {
  try {
    console.log('🔍 === VÉRIFICATION DE LA BASE DE DONNÉES ===\n');
    
    // Vérifier les utilisateurs
    console.log('👤 === UTILISATEURS ===');
    const users = await User.find({});
    console.log(`📊 Total: ${users.length}`);
    users.forEach(user => {
      console.log(`   • ${user.email} (${user.role}) - ${user.nom}`);
    });
    
    // Vérifier les produits
    console.log('\n📦 === PRODUITS ===');
    const produits = await Produit.find({});
    console.log(`📊 Total: ${produits.length}`);
    
    const produitsByUser = {};
    produits.forEach(produit => {
      const userId = produit.createdBy.toString();
      if (!produitsByUser[userId]) {
        const user = users.find(u => u._id.toString() === userId);
        produitsByUser[userId] = { user: user?.email || 'Inconnu', count: 0, categories: new Set() };
      }
      produitsByUser[userId].count++;
      produitsByUser[userId].categories.add(produit.categorie);
    });
    
    Object.entries(produitsByUser).forEach(([userId, data]) => {
      console.log(`   • ${data.user}: ${data.count} produits (${Array.from(data.categories).join(', ')})`);
    });
    
    // Vérifier les clients
    console.log('\n👥 === CLIENTS ===');
    const clients = await Client.find({});
    console.log(`📊 Total: ${clients.length}`);
    
    const clientsByUser = {};
    clients.forEach(client => {
      const userId = client.createdBy.toString();
      if (!clientsByUser[userId]) {
        const user = users.find(u => u._id.toString() === userId);
        clientsByUser[userId] = { user: user?.email || 'Inconnu', count: 0, clients: [] };
      }
      clientsByUser[userId].count++;
      clientsByUser[userId].clients.push(client.nom);
    });
    
    Object.entries(clientsByUser).forEach(([userId, data]) => {
      console.log(`   • ${data.user}: ${data.count} clients`);
      data.clients.forEach(client => {
        console.log(`     - ${client}`);
      });
    });
    
    // Vérifier les devis
    console.log('\n📋 === DEVIS ===');
    const devis = await Devis.find({}).populate('client', 'nom').populate('createdBy', 'email');
    console.log(`📊 Total: ${devis.length}`);
    
    const devisByUser = {};
    devis.forEach(devis => {
      const userEmail = devis.createdBy.email;
      if (!devisByUser[userEmail]) {
        devisByUser[userEmail] = { count: 0, devis: [] };
      }
      devisByUser[userEmail].count++;
      devisByUser[userEmail].devis.push({
        numero: devis.numero,
        client: devis.client.nom,
        statut: devis.statut,
        montantTTC: devis.montantTTC
      });
    });
    
    Object.entries(devisByUser).forEach(([userEmail, data]) => {
      console.log(`   • ${userEmail}: ${data.count} devis`);
      data.devis.forEach(devis => {
        console.log(`     - ${devis.numero}: ${devis.client} (${devis.statut}) - ${devis.montantTTC.toFixed(2)}€`);
      });
    });
    
    // Vérifier les factures
    console.log('\n🧾 === FACTURES ===');
    const factures = await Facture.find({}).populate('client', 'nom').populate('createdBy', 'email');
    console.log(`📊 Total: ${factures.length}`);
    
    const facturesByUser = {};
    factures.forEach(facture => {
      const userEmail = facture.createdBy.email;
      if (!facturesByUser[userEmail]) {
        facturesByUser[userEmail] = { count: 0, factures: [] };
      }
      facturesByUser[userEmail].count++;
      facturesByUser[userEmail].factures.push({
        numero: facture.numero,
        client: facture.client.nom,
        statut: facture.statut,
        montantTTC: facture.montantTTC,
        dateEcheance: facture.dateEcheance
      });
    });
    
    Object.entries(facturesByUser).forEach(([userEmail, data]) => {
      console.log(`   • ${userEmail}: ${data.count} factures`);
      data.factures.forEach(facture => {
        const echeance = facture.dateEcheance.toLocaleDateString('fr-FR');
        console.log(`     - ${facture.numero}: ${facture.client} (${facture.statut}) - ${facture.montantTTC.toFixed(2)}€ - Échéance: ${echeance}`);
      });
    });
    
    // Vérifier les relations
    console.log('\n🔗 === VÉRIFICATION DES RELATIONS ===');
    
    // Vérifier que tous les devis ont des clients valides
    const devisWithInvalidClient = devis.filter(d => !d.client);
    if (devisWithInvalidClient.length > 0) {
      console.log(`⚠️  ${devisWithInvalidClient.length} devis avec des clients invalides`);
    } else {
      console.log('✅ Tous les devis ont des clients valides');
    }
    
    // Vérifier que toutes les factures ont des clients valides
    const facturesWithInvalidClient = factures.filter(f => !f.client);
    if (facturesWithInvalidClient.length > 0) {
      console.log(`⚠️  ${facturesWithInvalidClient.length} factures avec des clients invalides`);
    } else {
      console.log('✅ Toutes les factures ont des clients valides');
    }
    
    // Vérifier que tous les devis ont des produits valides
    let devisWithInvalidProducts = 0;
    for (const devisItem of devis) {
      for (const ligne of devisItem.lignes) {
        try {
          await Produit.findById(ligne.produit);
        } catch (error) {
          devisWithInvalidProducts++;
        }
      }
    }
    
    if (devisWithInvalidProducts > 0) {
      console.log(`⚠️  ${devisWithInvalidProducts} lignes de devis avec des produits invalides`);
    } else {
      console.log('✅ Tous les devis ont des produits valides');
    }
    
    // Vérifier que toutes les factures ont des produits valides
    let facturesWithInvalidProducts = 0;
    for (const facture of factures) {
      for (const ligne of facture.lignes) {
        try {
          await Produit.findById(ligne.produit);
        } catch (error) {
          facturesWithInvalidProducts++;
        }
      }
    }
    
    if (facturesWithInvalidProducts > 0) {
      console.log(`⚠️  ${facturesWithInvalidProducts} lignes de factures avec des produits invalides`);
    } else {
      console.log('✅ Toutes les factures ont des produits valides');
    }
    
    // Résumé final
    console.log('\n📊 === RÉSUMÉ FINAL ===');
    console.log(`👤 Utilisateurs: ${users.length}`);
    console.log(`📦 Produits: ${produits.length}`);
    console.log(`👥 Clients: ${clients.length}`);
    console.log(`📋 Devis: ${devis.length}`);
    console.log(`🧾 Factures: ${factures.length}`);
    
    const totalMontantDevis = devis.reduce((sum, d) => sum + d.montantTTC, 0);
    const totalMontantFactures = factures.reduce((sum, f) => sum + f.montantTTC, 0);
    
    console.log(`💰 Montant total des devis: ${totalMontantDevis.toFixed(2)}€`);
    console.log(`💰 Montant total des factures: ${totalMontantFactures.toFixed(2)}€`);
    
    console.log('\n🎉 Base de données vérifiée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await verifyDatabase();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

main().catch(console.error);
