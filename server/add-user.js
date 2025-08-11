// Script pour ajouter un utilisateur unique
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

const addUser = async (userData) => {
  try {
    console.log('👤 === AJOUT D\'UN UTILISATEUR ===');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`⚠️  L'utilisateur ${userData.email} existe déjà !`);
      return existingUser;
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
    console.log(`✅ Utilisateur créé avec succès :`);
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
    
    // Exemple d'ajout d'un utilisateur
    const userData = {
      email: 'manager@factureasy.com',
      password: 'manager123',
      nom: 'Manager Commercial',
      role: 'user' // ou 'admin'
    };
    
    await addUser(userData);
    
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

module.exports = { addUser };
