import { useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Home, Building, Building2, Rocket, Space, Lock } from 'lucide-react';

import GameDashboard from './Game/Dashboard';

// Define the game levels
const gameLevels = [
  {
    id: 'apartment',
    name: 'Studio Apartment',
    icon: Home,
    description: 'Your first small space with room for a few plants',
    locked: false,
    maxPlants: 5
  },
  {
    id: 'condo',
    name: 'One Bedroom Condo',
    icon: Building,
    description: 'A bit more space for your growing collection',
    locked: true,
    maxPlants: 10,
    requiredTokens: 1000
  },
  {
    id: 'house',
    name: 'Suburban House',
    icon: Building2,
    description: 'Plenty of windows and space for many plants',
    locked: true,
    maxPlants: 20,
    requiredTokens: 2500
  },
  {
    id: 'mars',
    name: 'Mars Habitat',
    icon: Rocket,
    description: 'Grow exotic plants in a controlled Mars environment',
    locked: true,
    maxPlants: 30,
    requiredTokens: 5000
  },
  {
    id: 'europa',
    name: 'Europa Station',
    icon: Space,
    description: 'The ultimate space garden on Jupiter\'s moon',
    locked: true,
    maxPlants: 50,
    requiredTokens: 10000
  }
];

export default function Game() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/game/:level');
  const level = params?.level || 'apartment';
  
  // Enforce default level if none selected
  if (!params?.level) {
    setLocation('/game/apartment');
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-4 rounded-b-lg">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Indoor Jungle</h1>
          <Badge variant="outline" className="text-white border-white">
            Level: {level}
          </Badge>
        </div>
        <p className="text-sm opacity-90 mb-2">
          Grow your virtual plant collection from apartment to space station
        </p>
      </div>

      <div className="p-4">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Property Levels</CardTitle>
            <CardDescription>Unlock new properties to grow more plants</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
              {gameLevels.map((gameLevel) => (
                <Link key={gameLevel.id} href={gameLevel.locked ? '/game' : `/game/${gameLevel.id}`}>
                  <Button
                    variant={level === gameLevel.id ? "default" : "outline"}
                    className={`flex-col h-auto py-2 px-3 ${gameLevel.locked ? 'opacity-60' : ''}`}
                    disabled={gameLevel.locked}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {gameLevel.locked && <Lock className="h-3 w-3 absolute -mt-8" />}
                      <gameLevel.icon className="h-6 w-6 mb-1" />
                    </div>
                    <span className="text-xs font-medium">{gameLevel.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {gameLevel.maxPlants} plants
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Game Dashboard */}
        <GameDashboard />

        {/* Level Detail Section */}
        {level && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <div className="flex items-center">
                    {gameLevels.find(l => l.id === level)?.icon && (
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        {(() => {
                          const LevelIcon = gameLevels.find(l => l.id === level)?.icon || Home;
                          return <LevelIcon className="h-5 w-5 text-green-600" />;
                        })()}
                      </div>
                    )}
                    {gameLevels.find(l => l.id === level)?.name || 'Property'}
                  </div>
                </CardTitle>
                <Badge>
                  {gameLevels.find(l => l.id === level)?.maxPlants || 5} Plants
                </Badge>
              </div>
              <CardDescription>
                {gameLevels.find(l => l.id === level)?.description || 'Your current property'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Property Features</h3>
                  <p className="text-sm text-gray-500">
                    {level === 'apartment' && 'Small space with limited sunlight. Good for beginners.'}
                    {level === 'condo' && 'Modern space with better lighting and room for more plants.'}
                    {level === 'house' && 'Spacious environment with multiple rooms for different plants.'}
                    {level === 'mars' && 'Advanced hydroponics and specialized grow lights for exotic species.'}
                    {level === 'europa' && 'State-of-the-art environmental controls and unlimited space for plants.'}
                  </p>
                </div>
                
                {level !== 'europa' && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Next Upgrade</h3>
                    <p className="text-sm text-gray-500">
                      Save up {gameLevels.find((l, i) => i > gameLevels.findIndex(gl => gl.id === level))?.requiredTokens} LVS tokens to unlock the next level.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={level === 'europa'}>
                {level === 'europa' ? 'Maximum Level Reached' : 'Upgrade Property (Coming Soon)'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}