// Script interactif pour créer des utilisateurs
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connecté à MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

const question = (rl, prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createUserInteractive = async () => {
  try {
    console.log('🎯 === CRÉATION INTERACTIVE D\'UTILISATEUR ===\n');
    
    const rl = createInterface();
    
    // Demander les informations
    const email = await question(rl, '📧 Email de l\'utilisateur: ');
    const password = await question(rl, '🔑 Mot de passe: ');
    const nom = await question(rl, '👤 Nom complet: ');
    
    let role;
    do {
      role = await question(rl, '🔐 Rôle (admin/user): ').toLowerCase();
    } while (role !== 'admin' && role !== 'user');
    
    rl.close();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`\n⚠️  L'utilisateur ${email} existe déjà !`);
      console.log(`   Rôle actuel: ${existingUser.role}`);
      console.log(`   Nom: ${existingUser.nom}`);
      return existingUser;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Créer l'utilisateur
    const newUser = new User({
      email,
      password: hashedPassword,
      nom,
      role
    });
    
    await newUser.save();
    
    console.log('\n✅ Utilisateur créé avec succès !');
    console.log(`   📧 Email: ${newUser.email}`);
    console.log(`   👤 Nom: ${newUser.nom}`);
    console.log(`   🔑 Rôle: ${newUser.role}`);
    console.log(`   🆔 ID: ${newUser._id}`);
    
    return newUser;
    
  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Script de création d\'utilisateur interactif');
    console.log('💡 Remplissez les informations demandées\n');
    
    await createUserInteractive();
    
    // Demander si on veut créer un autre utilisateur
    const rl = createInterface();
    const continueCreating = await question(rl, '\n🔄 Créer un autre utilisateur ? (oui/non): ');
    rl.close();
    
    if (continueCreating.toLowerCase() === 'oui' || continueCreating.toLowerCase() === 'o') {
      await createUserInteractive();
    }
    
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

module.exports = { createUserInteractive };
