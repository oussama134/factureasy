import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { isSignedIn, user, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      // Récupérer le rôle depuis l'utilisateur JWT
      const role = user.role || 'user';
      setUserRole(role);
      setIsAdmin(role === 'admin');
      console.log('👑 Rôle utilisateur:', role);
    } else {
      setUserRole(null);
      setIsAdmin(false);
    }
  }, [isSignedIn, user]);

  return {
    userRole,
    isAdmin,
    isLoaded: !loading
  };
}; 