import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Produits from './pages/Produits';
import Devis from './pages/Devis';
import DevisDetail from './pages/DevisDetail';
import Factures from './pages/Factures';
import FactureDetail from './pages/FactureDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* UserSwitcher supprimé pour des raisons de sécurité */}
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/produits" element={
              <ProtectedRoute>
                <Produits />
              </ProtectedRoute>
            } />
            <Route path="/devis" element={
              <ProtectedRoute>
                <Devis />
              </ProtectedRoute>
            } />
            <Route path="/devis/:id" element={
              <ProtectedRoute>
                <DevisDetail />
              </ProtectedRoute>
            } />
            <Route path="/factures" element={
              <ProtectedRoute>
                <Factures />
              </ProtectedRoute>
            } />
            <Route path="/factures/:id" element={
              <ProtectedRoute>
                <FactureDetail />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
