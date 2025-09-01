import { useState, useEffect } from 'react';

interface User {
  id: string;
  displayName: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user
    const storedUserId = localStorage.getItem('plantcare_user_id');
    const storedDisplayName = localStorage.getItem('plantcare_display_name');
    
    if (storedUserId && storedDisplayName) {
      setUser({
        id: storedUserId,
        displayName: storedDisplayName
      });
    }
    
    setIsLoading(false);
  }, []);

  const setupUser = (userId: string, displayName: string) => {
    setUser({ id: userId, displayName });
  };

  const clearUser = () => {
    localStorage.removeItem('plantcare_user_id');
    localStorage.removeItem('plantcare_display_name');
    setUser(null);
  };

  return {
    user,
    isLoading,
    setupUser,
    clearUser
  };
}