require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Fonction pour tester avec différents rôles
const testRole = async (role) => {
  try {
    console.log(`\n🧪 === TEST AVEC RÔLE: ${role.toUpperCase()} ===`);
    
    const headers = {
      'Content-Type': 'application/json',
      'x-user-type': role
    };

    // Test 1: Récupérer les clients
    console.log('🔍 Test 1: Récupération des clients...');
    const clientsResponse = await axios.get(`${BASE_URL}/clients`, { headers });
    console.log(`✅ ${clientsResponse.data.length} clients trouvés pour ${role}`);

    // Test 2: Récupérer les factures
    console.log('🔍 Test 2: Récupération des factures...');
    const facturesResponse = await axios.get(`${BASE_URL}/factures`, { headers });
    console.log(`✅ ${facturesResponse.data.length} factures trouvées pour ${role}`);

    // Test 3: Récupérer les statistiques dashboard
    console.log('🔍 Test 3: Récupération des statistiques dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log(`✅ Dashboard - Clients: ${dashboardResponse.data.clients.total}`);
    console.log(`✅ Dashboard - Factures: ${dashboardResponse.data.factures.total}`);

    // Test 4: Récupérer les utilisateurs (admin seulement)
    if (role === 'admin' || role === 'super_admin') {
      console.log('🔍 Test 4: Récupération des utilisateurs (admin)...');
      const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      console.log(`✅ ${usersResponse.data.length} utilisateurs trouvés pour ${role}`);
    } else {
      console.log('🔍 Test 4: Accès aux utilisateurs refusé (utilisateur normal)');
    }

    // Test 5: Récupérer les statistiques admin (admin seulement)
    if (role === 'admin' || role === 'super_admin') {
      console.log('🔍 Test 5: Récupération des statistiques admin...');
      const adminStatsResponse = await axios.get(`${BASE_URL}/admin/stats`, { headers });
      console.log(`✅ Stats admin - Clients: ${adminStatsResponse.data.clients}`);
      console.log(`✅ Stats admin - Factures: ${adminStatsResponse.data.factures}`);
    } else {
      console.log('🔍 Test 5: Accès aux stats admin refusé (utilisateur normal)');
    }

  } catch (error) {
    console.error(`❌ Erreur pour le rôle ${role}:`, error.response?.data?.error || error.message);
  }
};

// Fonction principale
const runTests = async () => {
  console.log('🚀 Démarrage des tests de rôles...');
  
  // Tester avec différents rôles
  await testRole('user');
  await testRole('admin');
  await testRole('super_admin');
  
  console.log('\n✅ Tests terminés !');
};

// Exécuter les tests
runTests().catch(console.error); 