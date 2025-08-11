// Script de test pour vérifier la connectivité avec le backend
const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Test de connectivité avec le backend...');
    
    const response = await axios.get('https://factureasy.onrender.com/api/test', {
      timeout: 10000
    });
    
    console.log('✅ Backend accessible !');
    console.log('📊 Statut:', response.status);
    console.log('📝 Données:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur de connexion au backend:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Statut:', error.response?.status);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 Le backend met trop de temps à répondre (timeout)');
    } else if (error.response?.status === 404) {
      console.log('💡 Route /api/test non trouvée - vérifiez les routes du serveur');
    }
  }
}

testBackend();
