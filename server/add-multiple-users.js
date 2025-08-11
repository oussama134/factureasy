// Script pour ajouter plusieurs utilisateurs
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
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

const addMultipleUsers = async (usersList) => {
  try {
    console.log('👥 === AJOUT DE PLUSIEURS UTILISATEURS ===');
    
    const results = {
      created: [],
      existing: [],
      errors: []
    };
    
    for (const userData of usersList) {
      try {
        console.log(`\n🔍 Traitement de ${userData.email}...`);
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  ${userData.email} existe déjà (rôle: ${existingUser.role})`);
          results.existing.push(existingUser);
          continue;
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Créer le nouvel utilisateur
        const newUser = new User({
          email: userData.email,
          password: hashedPassword,
          nom: userData.nom,
          role: userData.role
        });
        
        await newUser.save();
        console.log(`✅ ${userData.email} créé avec succès (rôle: ${userData.role})`);
        results.created.push(newUser);
        
      } catch (error) {
        console.error(`❌ Erreur avec ${userData.email}:`, error.message);
        results.errors.push({ user: userData, error: error.message });
      }
    }
    
    // Résumé
    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`✅ Utilisateurs créés: ${results.created.length}`);
    console.log(`⚠️  Utilisateurs existants: ${results.existing.length}`);
    console.log(`❌ Erreurs: ${results.errors.length}`);
    
    if (results.created.length > 0) {
      console.log('\n🎉 Nouveaux utilisateurs créés :');
      results.created.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - ${user.nom}`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n❌ Erreurs rencontrées :');
      results.errors.forEach(item => {
        console.log(`   • ${item.user.email}: ${item.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    
    // Liste des utilisateurs à créer
    const usersToCreate = [
      {
        email: 'comptable@factureasy.com',
        password: 'comptable123',
        nom: 'Comptable Principal',
        role: 'admin'
      },
      {
        email: 'vendeur1@factureasy.com',
        password: 'vendeur123',
        nom: 'Vendeur Commercial',
        role: 'user'
      },
      {
        email: 'vendeur2@factureasy.com',
        password: 'vendeur456',
        nom: 'Vendeur Senior',
        role: 'user'
      },
      {
        email: 'directeur@factureasy.com',
        password: 'directeur123',
        nom: 'Directeur Général',
        role: 'admin'
      }
    ];
    
    await addMultipleUsers(usersToCreate);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

// Si exécuté directement, lancer le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addMultipleUsers };
