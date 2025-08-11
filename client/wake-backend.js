// Script pour réveiller le backend Render et tester la connexion
const https = require('https');

const BACKEND_URL = 'https://factureasy.onrender.com';

// Fonction pour faire une requête HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.setTimeout(30000); // 30 secondes
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test de réveil du backend
async function wakeBackend() {
  console.log('🌅 Tentative de réveil du backend Render...');
  
  try {
    // Premier appel pour réveiller le service
    console.log('📞 Premier appel (réveil)...');
    const response1 = await makeRequest(`${BACKEND_URL}/api/health`);
    console.log('✅ Premier appel réussi !');
    console.log('📊 Statut:', response1.status);
    console.log('📝 Données:', response1.data);
    
    // Attendre un peu que le service soit complètement réveillé
    console.log('⏳ Attente de 5 secondes...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Deuxième appel pour vérifier que le service est stable
    console.log('📞 Deuxième appel (vérification)...');
    const response2 = await makeRequest(`${BACKEND_URL}/api/health`);
    console.log('✅ Deuxième appel réussi !');
    console.log('📊 Statut:', response2.status);
    
    // Test de la route d'authentification
    console.log('🔐 Test de la route d\'authentification...');
    const authResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({
      email: 'admin@factureasy.com',
      password: 'admin123'
    }));
    
    console.log('✅ Route d\'authentification accessible !');
    console.log('📊 Statut:', authResponse.status);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.code === 'ECONNRESET') {
      console.log('💡 Le backend est probablement en cours de démarrage...');
    } else if (error.message === 'Timeout') {
      console.log('💡 Le backend met trop de temps à répondre (mode sleep)');
    }
  }
}

// Exécuter le test
wakeBackend();
