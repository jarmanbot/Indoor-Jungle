import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserSetupProps {
  onUserSetup: (userId: string, displayName: string) => void;
}

export function UserSetup({ onUserSetup }: UserSetupProps) {
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) return;
    
    setIsSubmitting(true);
    
    // Create unique user ID with timestamp
    const userId = `user_${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    
    // Store in localStorage for persistence
    localStorage.setItem('plantcare_user_id', userId);
    localStorage.setItem('plantcare_display_name', displayName.trim());
    
    onUserSetup(userId, displayName.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
            🌿 Welcome to Indoor Jungle
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Your personal plant care companion
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                What's your name?
              </label>
              <Input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full"
                data-testid="input-user-name"
                disabled={isSubmitting}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be saved and you won't need to enter it again
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              disabled={!displayName.trim() || isSubmitting}
              data-testid="button-start-app"
            >
              {isSubmitting ? 'Setting up...' : 'Start Using Indoor Jungle'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}