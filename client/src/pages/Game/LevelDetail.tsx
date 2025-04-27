import { useParams, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Home, Building, Building2, Rocket, Space } from 'lucide-react';

// Define the game levels (same as in Game.tsx)
const gameLevels = [
  {
    id: 'level1',
    name: 'Studio Apartment',
    icon: Home,
    description: 'Your first small space with room for a few plants',
    locked: false,
    maxPlants: 5,
    conceptArt: '/game-concepts/placeholder-level1.png',
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
    conceptArt: '/game-concepts/placeholder-level2.png',
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
    conceptArt: '/game-concepts/placeholder-level3.png',
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
    conceptArt: '/game-concepts/placeholder-level4.png',
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
    conceptArt: '/game-concepts/placeholder-level5.png',
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
    conceptArt: '/game-concepts/placeholder-level6.png',
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
    conceptArt: '/game-concepts/placeholder-level7.png',
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
    conceptArt: '/game-concepts/placeholder-level8.png',
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
    conceptArt: '/game-concepts/placeholder-level9.png',
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
    conceptArt: '/game-concepts/placeholder-level10.png',
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
    conceptArt: '/game-concepts/placeholder-level11.png',
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
    conceptArt: '/game-concepts/placeholder-level12.png',
    details: 'The pinnacle of plant cultivation technology, a massive space station hosting plants collected from across the galaxy. Features thousands of specialized environmental chambers simulating diverse alien worlds. The galaxy\'s largest repository of plant genetic material and cultivation knowledge.'
  }
];

export default function LevelDetail() {
  const { level } = useParams();
  const currentLevel = gameLevels.find(l => l.id === level) || gameLevels[0];
  
  // Find next level
  const currentIndex = gameLevels.findIndex(l => l.id === level);
  const nextLevel = currentIndex < gameLevels.length - 1 ? gameLevels[currentIndex + 1] : null;
  
  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/game">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <currentLevel.icon className="h-5 w-5 text-green-600" />
              </div>
              {currentLevel.name}
            </CardTitle>
            <Badge>Level {level?.replace('level', '')}</Badge>
          </div>
          <CardDescription>{currentLevel.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Concept Art Placeholder */}
          <div className="border rounded-md overflow-hidden bg-white h-64 flex items-center justify-center">
            <img 
              src={`/game-concepts/placeholder-level${level?.replace('level', '')}.svg`} 
              alt={`${currentLevel.name} Concept Art`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Level Details</h3>
            <p className="text-gray-700">{currentLevel.details}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-500">Maximum Plants</h4>
              <p className="text-xl font-bold text-green-600">{currentLevel.maxPlants}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-500">Tokens Required</h4>
              <p className="text-xl font-bold text-amber-600">
                {currentLevel.requiredTokens || "0"} LVS
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Plant Types & Benefits</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Specialized growing environments for unique plant varieties</li>
              <li>Environmental controls optimized for this level's conditions</li>
              <li>Special research and breeding opportunities</li>
              <li>Unique plant visual effects and properties</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          {nextLevel ? (
            <div className="w-full">
              <h3 className="text-md font-semibold mb-2">Next Level: {nextLevel.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{nextLevel.description}</p>
              <Button className="w-full" disabled>Upgrade (Coming Soon)</Button>
            </div>
          ) : (
            <div className="w-full text-center">
              <Badge className="mx-auto mb-2">Maximum Level Reached</Badge>
              <p className="text-sm text-gray-600">You've reached the pinnacle of plant cultivation technology!</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}