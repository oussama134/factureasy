import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          📄 FactureEasy
        </Link>
        {user && (
          <div className="user-welcome">
            <span>👋 Bienvenue, {user.firstName || 'Utilisateur'} !</span>
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
        <SignedOut>
          <SignInButton mode="modal">
            <button className="auth-nav-btn">
              🔐 Connexion
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%'
                }
              }
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
