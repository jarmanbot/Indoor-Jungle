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
    id: 'level1',
    name: 'Studio Apartment',
    icon: Home,
    description: 'Your first small space with room for a few plants',
    locked: false,
    maxPlants: 5,
    conceptArt: '/game-concepts/level1.jpg',
    details: 'A cozy studio apartment with basic amenities. Perfect for starting your plant collection with a few small plants like succulents and air plants. Limited sunlight requires strategic placement of your plants.'
  },
  {
    id: 'level2',
    name: 'One Bedroom Condo',
    icon: Building,
    description: 'A bit more space for your growing collection',
    locked: false,
    maxPlants: 10,
    requiredTokens: 1000,
    conceptArt: '/game-concepts/level2.jpg',
    details: 'A modern condo with better lighting and more space for plants. You can now start growing medium-sized plants and experiment with hanging planters. The balcony allows for some outdoor plant varieties.'
  },
  {
    id: 'level3',
    name: 'Suburban House',
    icon: Building2,
    description: 'Plenty of windows and space for many plants',
    locked: false,
    maxPlants: 20,
    requiredTokens: 2500,
    conceptArt: '/game-concepts/level3.jpg',
    details: 'A spacious suburban house with multiple rooms and good natural lighting. Perfect for diversifying your collection with larger floor plants and creating dedicated plant areas. The garden allows for growing outdoor plants and small trees.'
  },
  {
    id: 'level4',
    name: 'Mansion',
    icon: Building2,
    description: 'Luxury living with extensive space for rare plants',
    locked: false,
    maxPlants: 30,
    requiredTokens: 5000,
    conceptArt: '/game-concepts/level4.jpg',
    details: 'A luxury mansion with greenhouse attachments and perfect environmental controls. Ideal for rare and exotic plant species that require specific conditions. Features include automated watering systems and specialized growing areas.'
  },
  {
    id: 'level5',
    name: 'Botanical Center',
    icon: Building2,
    description: 'Professional plant research and cultivation center',
    locked: false,
    maxPlants: 50,
    requiredTokens: 10000,
    conceptArt: '/game-concepts/level5.jpg',
    details: 'A state-of-the-art botanical research center with multiple controlled environments. Enables cultivation of endangered species and experimental hybrids. Features advanced hydroponics, aeroponics, and tissue culture facilities.'
  },
  {
    id: 'level6',
    name: 'Cloud City',
    icon: Building2,
    description: 'High altitude cultivation with advanced atmospheric controls',
    locked: false,
    maxPlants: 75,
    requiredTokens: 20000,
    conceptArt: '/game-concepts/level6.jpg',
    details: 'A floating cultivation center that harnesses unique high-altitude growing conditions. Specialized for cloud forest plants and species that thrive in low pressure environments. Features water harvesting from clouds and solar amplification systems.'
  },
  {
    id: 'level7',
    name: 'Underwater Dome',
    icon: Building2,
    description: 'Subaquatic plant research facility with unique light filtering',
    locked: false,
    maxPlants: 100,
    requiredTokens: 35000,
    conceptArt: '/game-concepts/level7.jpg',
    details: 'An underwater research dome that uses filtered sunlight through water for unique growing conditions. Perfect for aquatic plants and species that benefit from high humidity. Water pressure and specialized nutrients create plants with unique properties.'
  },
  {
    id: 'level8',
    name: 'Arctic Research Station',
    icon: Building2,
    description: 'Cold climate plant research in extreme conditions',
    locked: false,
    maxPlants: 125,
    requiredTokens: 50000,
    conceptArt: '/game-concepts/level8.jpg',
    details: 'A cutting-edge research facility in the Arctic Circle specialized for cold-weather plant species. Features thermal gradient chambers and cryogenic preservation units. Research focuses on plants with extreme cold tolerance and rapid growing seasons.'
  },
  {
    id: 'level9',
    name: 'Mars Habitat',
    icon: Rocket,
    description: 'Grow exotic plants in a controlled Mars environment',
    locked: false,
    maxPlants: 150,
    requiredTokens: 75000,
    conceptArt: '/game-concepts/level9.jpg',
    details: 'A Martian colony with specialized dome habitats for plants that can grow in the thin Martian atmosphere. Utilizes Martian soil with amendments and radiation-resistant enclosures. Research focuses on terraforming species and survival-focused agriculture.'
  },
  {
    id: 'level10',
    name: 'Europa Station',
    icon: Space,
    description: 'Subglacial oceanic research on Jupiter\'s moon',
    locked: false,
    maxPlants: 200,
    requiredTokens: 100000,
    conceptArt: '/game-concepts/level10.jpg',
    details: 'A research station beneath the ice of Europa, using the ocean\'s thermal vents for energy. Specialized for studying adaptations to extreme pressure and alternative light sources. Experiments with bioluminescent plant species and chemosynthetic processes.'
  },
  {
    id: 'level11',
    name: 'Titan Greenhouse',
    icon: Space,
    description: 'Cultivation in methane-rich atmosphere of Saturn\'s moon',
    locked: false,
    maxPlants: 250,
    requiredTokens: 150000,
    conceptArt: '/game-concepts/level11.jpg',
    details: 'A groundbreaking facility on Titan utilizing the methane-rich atmosphere for novel plant development. Experiments with silicon-based alternatives to carbon-based plant life. The extreme cold and exotic chemistry enables entirely new plant varieties.'
  },
  {
    id: 'level12',
    name: 'Intergalactic Arboretum',
    icon: Space,
    description: 'The ultimate plant collection facility across star systems',
    locked: false,
    maxPlants: 500,
    requiredTokens: 250000,
    conceptArt: '/game-concepts/level12.jpg',
    details: 'The pinnacle of plant cultivation technology, a massive space station hosting plants collected from across the galaxy. Features thousands of specialized environmental chambers simulating diverse alien worlds. The galaxy\'s largest repository of plant genetic material and cultivation knowledge.'
  }
];

export default function Game() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/game/:level');
  const level = params?.level || 'apartment';
  
  // Enforce default level if none selected
  if (!params?.level) {
    setLocation('/game/level1');
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
        {/* Main Game Dashboard */}
        <GameDashboard />
        
        {/* Property Levels - Moved lower on the page as requested */}
        <Card className="my-6">
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
                    {gameLevels.find(l => l.id === level)?.details || 
                     'A unique environment for growing plants with special properties.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Plant Capacity</h3>
                  <p className="text-sm text-gray-500">
                    This property can support up to {gameLevels.find(l => l.id === level)?.maxPlants || 5} plants.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Link href={`/game/level/${level === 'apartment' ? '1' : 
                               level === 'condo' ? '2' : 
                               level === 'house' ? '3' : 
                               level === 'mars' ? '9' : 
                               level === 'europa' ? '10' : '1'}`}>
                    <Button className="w-full" variant="outline">
                      View Level Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Upgrade Property (Coming Soon)
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}