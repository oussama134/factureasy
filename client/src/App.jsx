import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Factures from './pages/Factures';
import Produits from './pages/Produits';
import Devis from './pages/Devis';
import DevisDetail from './pages/DevisDetail';
import FactureDetail from './pages/FactureDetail';
import { SignIn } from '@clerk/clerk-react';
import './App.css';

function App() {
  return (
    <div>
      <SignedIn>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/factures" element={<Factures />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/factures/:id" element={<FactureDetail />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/devis/:id" element={<DevisDetail />} />
            <Route path="/sign-in" element={<SignIn />} />
          </Routes>
        </BrowserRouter>
      </SignedIn>
      
      <SignedOut>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>🔐 Bienvenue sur FactureEasy</h1>
              <p>Gérez vos factures, clients et produits en toute simplicité</p>
            </div>
            <div className="auth-content">
              <SignInButton mode="modal">
                <button className="auth-button signin-btn">
                  🚀 Se connecter
                </button>
              </SignInButton>
              <div className="auth-divider">
                <span>ou</span>
              </div>
              <SignInButton mode="modal" redirectUrl="/dashboard">
                <button className="auth-button signup-btn">
                  ✨ Créer un compte
                </button>
              </SignInButton>
            </div>
            <div className="auth-features">
              <div className="feature">
                <span className="feature-icon">📄</span>
                <span>Gestion des factures</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Gestion des clients</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📦</span>
                <span>Gestion des produits</span>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}

export default App;
