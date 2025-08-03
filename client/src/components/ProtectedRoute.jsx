import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Afficher un loader pendant le chargement de l'authentification
  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non connecté
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Afficher le contenu protégé si connecté
  return children;
};

export default ProtectedRoute; 