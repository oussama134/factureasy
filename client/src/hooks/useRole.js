import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // En mode développement, simuler un utilisateur admin
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Mode développement - Utilisateur admin simulé');
          setUserRole('admin');
          setIsAdmin(true);
          return;
        }

        // Pour la production avec Clerk
        if (isSignedIn && isLoaded) {
          // Ici vous pouvez récupérer le rôle depuis Clerk ou votre API
          // Pour l'instant, on simule un utilisateur normal
          setUserRole('user');
          setIsAdmin(false);
        } else {
          setUserRole(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du rôle:', error);
        setUserRole(null);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, [isSignedIn, isLoaded]);

  return {
    userRole,
    isAdmin,
    isLoaded: isLoaded
  };
}; 