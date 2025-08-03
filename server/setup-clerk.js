require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const setupClerk = async () => {
  try {
    console.log('🔧 Configuration de Clerk...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/factureasy');
    console.log('✅ Connecté à MongoDB');
    
    // Créer un utilisateur admin par défaut
    const adminUser = await User.findOne({ email: 'admin@factureasy.com' });
    
    if (!adminUser) {
      const newAdmin = new User({
        clerkId: 'admin-default-123',
        email: 'admin@factureasy.com',
        firstName: 'Admin',
        lastName: 'FactureEasy',
        role: 'super_admin',
        permissions: ['read_clients', 'write_clients', 'read_factures', 'write_factures', 'read_devis', 'write_devis', 'manage_users', 'view_stats']
      });
      
      await newAdmin.save();
      console.log('✅ Utilisateur admin créé:', newAdmin.email);
    } else {
      console.log('✅ Utilisateur admin existe déjà:', adminUser.email);
    }
    
    // Afficher tous les utilisateurs
    const users = await User.find({});
    console.log('\n📋 Utilisateurs dans la base de données:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    console.log('\n🎯 Instructions pour configurer Clerk:');
    console.log('1. Allez sur https://clerk.com/');
    console.log('2. Créez un compte et une application');
    console.log('3. Récupérez vos clés dans les paramètres');
    console.log('4. Ajoutez ces variables dans votre fichier .env:');
    console.log('   CLERK_SECRET_KEY=sk_test_votre_cle_secrete');
    console.log('   CLERK_PUBLISHABLE_KEY=pk_test_votre_cle_publique');
    
    await mongoose.disconnect();
    console.log('\n✅ Configuration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur configuration:', error);
    process.exit(1);
  }
};

setupClerk(); 