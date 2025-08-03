import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import { useAuth } from '@clerk/clerk-react';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [stats, setStats] = useState({
    totalDevis: 0,
    totalFactures: 0,
    totalClients: 0,
    totalProduits: 0,
    devis: {
      total: 0,
      acceptes: 0,
      refuses: 0,
      enAttente: 0,
      expires: 0,
      tauxConversion: 0,
      montantTotal: 0,
      recents: 0
    },
    factures: {
      total: 0,
      payees: 0,
      enAttente: 0,
      brouillon: 0,
      tauxPaiement: 0,
      montantTotal: 0,
      recentes: 0
    },
    clients: {
      total: 0,
      actifs: 0,
      prospects: 0
    },
    produits: {
      total: 0,
      actifs: 0,
      rupture: 0
    },
    topClients: [],
    topProduits: [],
    user: {
      id: '',
      email: '',
      name: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null); // Réinitialiser l'erreur
        
        // Test direct du token
        console.log('🔍 Test direct du token dans Dashboard');
        console.log('🔍 isSignedIn:', isSignedIn);
        
        if (isSignedIn) {
          const token = await getToken();
          console.log('🔍 Token direct:', token ? 'Présent' : 'Absent');
        }
        
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur Dashboard:', err);
        
        // Gestion spécifique des erreurs d'authentification
        if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          showError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError('Erreur lors du chargement des statistiques');
          showError('Erreur lors du chargement des statistiques');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isSignedIn, getToken]);

  // Fonctions pour les boutons d'action
  const handleNouvelleFacture = () => {
    // On va vers factures avec un paramètre pour ouvrir le formulaire
    navigate('/factures?action=create');
    showSuccess('Ouverture du formulaire de facture...');
  };

  const handleNouveauDevis = () => {
    // On va vers devis avec un paramètre pour ouvrir le formulaire
    navigate('/devis?action=create');
    showSuccess('Ouverture du formulaire de devis...');
  };

  const handleNouveauClient = () => {
    // On va vers clients avec un paramètre pour ouvrir le modal
    navigate('/clients?action=create');
    showSuccess('Ouverture du formulaire de client...');
  };

  const handleNouveauProduit = () => {
    // On va vers produits avec un paramètre pour ouvrir le modal
    navigate('/produits?action=create');
    showSuccess('Ouverture du formulaire de produit...');
  };

  const handleVoirFactures = () => {
    navigate('/factures');
    showSuccess('Navigation vers la liste des factures...');
  };

  const handleVoirDevis = () => {
    navigate('/devis');
    showSuccess('Navigation vers la liste des devis...');
  };

  const handleVoirClients = () => {
    navigate('/clients');
    showSuccess('Navigation vers la gestion des clients...');
  };

  const handleVoirProduits = () => {
    navigate('/produits');
    showSuccess('Navigation vers la gestion des produits...');
  };

  // Nouvelles fonctions pour des actions vraiment différentes
  const handleFacturesDuMois = () => {
    // On va vers factures avec un filtre pour ce mois
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    navigate(`/factures?filter=month&month=${currentMonth}&year=${currentYear}`);
    showSuccess('Affichage des factures du mois en cours...');
  };

  const handleFacturesEnAttente = () => {
    // On va vers factures avec un filtre pour les factures en attente
    navigate('/factures?filter=status&status=envoye');
    showSuccess('Affichage des factures en attente de paiement...');
  };

  const handleFacturesPayees = () => {
    // On va vers factures avec un filtre pour les factures payées
    navigate('/factures?filter=status&status=payee');
    showSuccess('Affichage des factures payées...');
  };

  const handleClientsRecents = () => {
    // On va vers clients avec un filtre pour les clients récents
    navigate('/clients?filter=recent');
    showSuccess('Affichage des clients récents...');
  };

  const handleProduitsPopulaires = () => {
    // On va vers produits avec un filtre pour les produits populaires
    navigate('/produits?filter=popular');
    showSuccess('Affichage des produits les plus populaires...');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>📊 Tableau de Bord</h1>
          <p>Vue d'ensemble de votre activité</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card clients" onClick={handleVoirClients}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Clients</h3>
              <p className="stat-number">{stats.totalClients || 0}</p>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-action">
              <span>👆 Cliquer pour voir</span>
            </div>
          </div>

          <div className="stat-card factures" onClick={handleVoirFactures}>
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Factures</h3>
              <p className="stat-number">{stats.totalFactures || 0}</p>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-action">
              <span>👆 Cliquer pour voir</span>
            </div>
          </div>

          <div className="stat-card produits" onClick={handleVoirProduits}>
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Produits</h3>
              <p className="stat-number">{stats.totalProduits || 0}</p>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-action">
              <span>👆 Cliquer pour voir</span>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Chiffre d'Affaires</h3>
              <p className="stat-number">
                {((stats.factures?.montantTotal || 0) + (stats.devis?.montantTotal || 0)).toLocaleString('fr-FR')} MAD
              </p>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="detailed-stats">
          <div className="stats-section">
            <h3>📊 Statistiques Détaillées</h3>
            <div className="detailed-grid">
              <div className="detail-card devis">
                <h4>📋 Devis</h4>
                <div className="detail-stats">
                  <div className="detail-item">
                    <span>Total:</span>
                    <strong>{stats.devis?.total || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Acceptés:</span>
                    <strong className="success">{stats.devis?.acceptes || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>En attente:</span>
                    <strong className="warning">{stats.devis?.enAttente || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Taux de conversion:</span>
                    <strong>{stats.devis?.tauxConversion || 0}%</strong>
                  </div>
                  <div className="detail-item">
                    <span>Montant total:</span>
                    <strong>{(stats.devis?.montantTotal || 0).toLocaleString('fr-FR')} MAD</strong>
                  </div>
                </div>
              </div>

              <div className="detail-card factures">
                <h4>📄 Factures</h4>
                <div className="detail-stats">
                  <div className="detail-item">
                    <span>Total:</span>
                    <strong>{stats.factures?.total || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Payées:</span>
                    <strong className="success">{stats.factures?.payees || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>En attente:</span>
                    <strong className="warning">{stats.factures?.enAttente || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Taux de paiement:</span>
                    <strong>{stats.factures?.tauxPaiement || 0}%</strong>
                  </div>
                  <div className="detail-item">
                    <span>Montant total:</span>
                    <strong>{(stats.factures?.montantTotal || 0).toLocaleString('fr-FR')} MAD</strong>
                  </div>
                </div>
              </div>

              <div className="detail-card clients">
                <h4>👥 Clients</h4>
                <div className="detail-stats">
                  <div className="detail-item">
                    <span>Total:</span>
                    <strong>{stats.clients?.total || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Actifs:</span>
                    <strong className="success">{stats.clients?.actifs || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Prospects:</span>
                    <strong className="info">{stats.clients?.prospects || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-card produits">
                <h4>📦 Produits</h4>
                <div className="detail-stats">
                  <div className="detail-item">
                    <span>Total:</span>
                    <strong>{stats.produits?.total || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Actifs:</span>
                    <strong className="success">{stats.produits?.actifs || 0}</strong>
                  </div>
                  <div className="detail-item">
                    <span>En rupture:</span>
                    <strong className="danger">{stats.produits?.rupture || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button className="action-btn primary" onClick={handleNouvelleFacture}>
            📄 Nouvelle Facture
          </button>
          <button className="action-btn secondary" onClick={handleNouveauDevis}>
            📄 Nouveau Devis
          </button>
          <button className="action-btn secondary" onClick={handleNouveauClient}>
            👥 Nouveau Client
          </button>
          <button className="action-btn secondary" onClick={handleNouveauProduit}>
            📦 Nouveau Produit
          </button>
        </div>

        <div className="quick-stats">
          <h3>🚀 Actions Rapides</h3>
          <div className="quick-actions">
            <button className="quick-btn" onClick={handleVoirFactures}>
              📋 Toutes les Factures
            </button>
            <button className="quick-btn" onClick={handleVoirDevis}>
              📄 Tous les Devis
            </button>
            <button className="quick-btn" onClick={handleVoirClients}>
              👥 Gérer les Clients
            </button>
            <button className="quick-btn" onClick={handleVoirProduits}>
              📦 Gérer les Produits
            </button>
          </div>
        </div>

        <div className="dashboard-insights">
          <h3>📊 Insights & Rapports</h3>
          <div className="insights-grid">
            <button className="insight-btn" onClick={handleFacturesDuMois}>
              📈 Factures du Mois
            </button>
            <button className="insight-btn" onClick={handleFacturesEnAttente}>
              ⚠️ Factures en Attente
            </button>
            <button className="insight-btn" onClick={handleFacturesPayees}>
              ✅ Factures Payées
            </button>
            <button className="insight-btn" onClick={handleClientsRecents}>
              👥 Clients Récents
            </button>
            <button className="insight-btn" onClick={handleProduitsPopulaires}>
              🔥 Produits Populaires
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </>
  );
}

export default Dashboard;
