import { useAuth as useClerkAuth } from '@clerk/clerk-react';

export const useAuth = () => {
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();

  const getAuthToken = async () => {
    try {
      if (isSignedIn) {
        return await getToken();
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  return {
    getAuthToken,
    isSignedIn,
    isLoaded
  };
}; 