const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

// Modèles
const User = require('./models/User');
const Devis = require('./models/Devis');

async function testJWTRoles() {
  try {
    console.log('🔍 === TEST JWT ET RÔLES ===');
    
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // 1. Récupérer les utilisateurs
    const admin = await User.findOne({ email: 'admin@factureasy.com' });
    const user = await User.findOne({ email: 'user@factureasy.com' });
    
    console.log('\n👥 === UTILISATEURS ===');
    console.log('👑 Admin:', admin.email, '(ID:', admin._id, ') - Rôle:', admin.role);
    console.log('👤 User:', user.email, '(ID:', user._id, ') - Rôle:', user.role);
    
    // 2. Générer des tokens JWT
    const adminToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n🔑 === TOKENS JWT ===');
    console.log('👑 Admin Token:', adminToken.substring(0, 50) + '...');
    console.log('👤 User Token:', userToken.substring(0, 50) + '...');
    
    // 3. Vérifier les tokens
    const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
    
    console.log('\n🔍 === DÉCODAGE TOKENS ===');
    console.log('👑 Admin decoded:', decodedAdmin);
    console.log('👤 User decoded:', decodedUser);
    
    // 4. Simuler les requêtes
    console.log('\n📋 === SIMULATION REQUÊTES ===');
    
    // Admin devrait voir tous les devis
    const allDevis = await Devis.find({}).populate('createdBy', 'email role');
    console.log('📊 Total devis dans la base:', allDevis.length);
    allDevis.forEach(d => {
      const createdBy = d.createdBy;
      console.log(`  - ${d.numero} (créé par: ${createdBy.email} - ${createdBy.role})`);
    });
    
    // User devrait voir seulement ses devis
    const userDevis = await Devis.find({ createdBy: user._id }).populate('createdBy', 'email role');
    console.log('\n👤 Devis de user@factureasy.com:', userDevis.length);
    userDevis.forEach(d => {
      const createdBy = d.createdBy;
      console.log(`  - ${d.numero} (créé par: ${createdBy.email} - ${createdBy.role})`);
    });
    
    // Admin devrait voir tous les devis
    const adminDevis = await Devis.find({}).populate('createdBy', 'email role');
    console.log('\n👑 Devis de admin@factureasy.com (tous):', adminDevis.length);
    adminDevis.forEach(d => {
      const createdBy = d.createdBy;
      console.log(`  - ${d.numero} (créé par: ${createdBy.email} - ${createdBy.role})`);
    });
    
    // 5. Test de filtrage par rôle
    console.log('\n🔍 === TEST FILTRAGE PAR RÔLE ===');
    
    // Simuler la logique de la route
    const simulateRoute = async (userRole, userId) => {
      console.log(`\n🔄 Simulation pour ${userRole} (ID: ${userId})`);
      
      let devis = [];
      if (userRole === 'admin') {
        devis = await Devis.find({}).populate('createdBy', 'email role');
        console.log('👑 Admin voit tous les devis:', devis.length);
      } else {
        devis = await Devis.find({ createdBy: userId }).populate('createdBy', 'email role');
        console.log('👤 User voit ses devis:', devis.length);
      }
      
      devis.forEach(d => {
        const createdBy = d.createdBy;
        console.log(`  - ${d.numero} (créé par: ${createdBy.email})`);
      });
      
      return devis;
    };
    
    await simulateRoute('admin', admin._id);
    await simulateRoute('user', user._id);
    
    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testJWTRoles(); 