import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { isSignedIn, user, logout } = useAuth();
  const { userRole } = useRole();

  const handleLogout = () => {
    logout();
    // Rediriger vers la page de connexion ou dashboard
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          📄 FactureEasy
        </Link>
        {isSignedIn && user && (
          <div className="user-welcome">
            <span>👋 Bienvenue, {user.firstName || user.email} !</span>
            <span className="user-role">👑 {userRole}</span>
          </div>
        )}
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/clients" 
          className={location.pathname === '/clients' ? 'active' : ''}
        >
          👥 Clients
        </Link>
        <Link 
          to="/devis" 
          className={location.pathname === '/devis' ? 'active' : ''}
        >
          📋 Devis
        </Link>
        <Link 
          to="/factures" 
          className={location.pathname === '/factures' ? 'active' : ''}
        >
          📄 Factures
        </Link>
        <Link 
          to="/produits" 
          className={location.pathname === '/produits' ? 'active' : ''}
        >
          📦 Produits
        </Link>
      </div>
      
      <div className="navbar-auth">
        {!isSignedIn ? (
          <Link to="/login">
            <button className="auth-nav-btn">
              🔐 Connexion
            </button>
          </Link>
        ) : (
          <div className="user-menu">
            <div className="user-info">
              <span className="user-avatar">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
              <span className="user-name">
                {user?.firstName || user?.email}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
