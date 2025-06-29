
import { Link } from "wouter";
import { 
  Leaf, 
  Sprout, 
  Flower2, 
  QrCode, 
  Coins, 
  Medal, 
  ArrowRight,
  Gamepad,
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

// Simple SVG illustrations
const PlantIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <rect x="35" y="70" width="30" height="25" fill="#8B4513" rx="2"/>
    <path d="M40 70 Q50 50 60 70" fill="#22C55E" stroke="#16A34A" strokeWidth="2"/>
    <circle cx="45" cy="60" r="3" fill="#EF4444"/>
    <circle cx="55" cy="58" r="2" fill="#F59E0B"/>
  </svg>
);

const NFTIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <rect x="20" y="20" width="60" height="60" fill="#3B82F6" rx="8" stroke="#1D4ED8" strokeWidth="2"/>
    <rect x="30" y="30" width="40" height="40" fill="#93C5FD" rx="4"/>
    <circle cx="50" cy="50" r="8" fill="#FBBF24"/>
    <text x="50" y="75" textAnchor="middle" fontSize="8" fill="white">NFT</text>
  </svg>
);

const TokenIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <circle cx="50" cy="50" r="30" fill="#F59E0B" stroke="#D97706" strokeWidth="3"/>
    <text x="50" y="55" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">LVS</text>
    <path d="M25 50 L35 40 L35 45 L65 45 L65 40 L75 50 L65 60 L65 55 L35 55 L35 60 Z" fill="#FCD34D" opacity="0.7"/>
  </svg>
);

export default function GrowToEarn() {
  return (
    <div className="pb-20">
      {/* Simple Hero section */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 text-center">
        <div className="mb-4">
          <Sprout className="h-12 w-12 mx-auto mb-2" />
          <h1 className="text-3xl font-bold">Grow to Earn</h1>
        </div>
        <p className="text-lg mb-6 leading-relaxed">
          Turn your real plant care into virtual rewards!
        </p>
        
        {/* Simple visual flow */}
        <div className="flex justify-center items-center space-x-4 mb-4">
          <div className="text-center">
            <PlantIllustration />
            <p className="text-sm mt-1">Care for Real Plants</p>
          </div>
          <ArrowRight className="h-6 w-6 opacity-80" />
          <div className="text-center">
            <NFTIllustration />
            <p className="text-sm mt-1">Get NFT Plants</p>
          </div>
          <ArrowRight className="h-6 w-6 opacity-80" />
          <div className="text-center">
            <TokenIllustration />
            <p className="text-sm mt-1">Earn LVS Tokens</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-8">
          <ChevronDown className="h-6 w-6 animate-bounce opacity-70" />
        </div>
      </div>

      {/* How it works - Simple steps */}
      <div className="p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Add Your Real Plants</h3>
              <p className="text-gray-600">Track your plant care in the app - watering, feeding, and general maintenance.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Connect Your Wallet</h3>
              <p className="text-gray-600">Link your crypto wallet (MetaMask recommended) to access game features.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Get NFT Plants</h3>
              <p className="text-gray-600">Your real plant care creates virtual NFT plants that grow with your care success.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Earn LVS Tokens</h3>
              <p className="text-gray-600">Get rewarded with LVS tokens for consistent plant care and game activities.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Explanation Section */}
      <div className="p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-center">The Complete Grow-to-Earn System</h2>
        
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Real World meets Virtual World</h3>
          <p className="text-gray-700 leading-relaxed">
            Grow to Earn connects your real world plant babies to the virtual world. Connect your crypto wallet to the INDOOR JUNGLE app, register your plant pot via the QR code and your first plant NFT will be ready for you in the game. Complete tasks in the game to upgrade your virtual plants and earn LVS tokens, the in-game currency.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-blue-600" />
                NFT Plant Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Purchase and mint digital NFT planters that link to your real plants. Different rarities offer different benefits and earning potential.
              </p>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Rarer NFT plants generate more LVS tokens and unlock special bonuses
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="h-5 w-5 mr-2 text-yellow-600" />
                LVS Token Economy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                The more you upgrade your NFTs, the more LVS tokens you can earn. Buy and sell your virtual plants, pots and other plant care accessory NFTs to earn LVS. Use LVS in-game to buy even more plant NFTs or collectible plant pots.
              </p>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-xs text-yellow-700">
                  <strong>Real Value:</strong> Withdraw your LVS and swap them for other cryptocurrencies like Bitcoin, Ethereum or Ripple
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad className="h-5 w-5 mr-2 text-purple-600" />
                Game Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Your real plant care success directly impacts your virtual plant health and earning potential. The app tracks your care activities and rewards consistent, quality care.
              </p>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-xs text-purple-700">
                  <strong>Growth System:</strong> Virtual plants level up based on your real-world care consistency
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits section */}
      <div className="p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Benefits</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="bg-amber-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-2">
              <Medal className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-medium text-sm mb-1">Achievements</h3>
            <p className="text-xs text-gray-600">Unlock special achievements for long-term plant care</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="bg-blue-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-2">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm mb-1">Token Rewards</h3>
            <p className="text-xs text-gray-600">Earn LVS tokens for daily plant care activities</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="bg-purple-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-2">
              <Gamepad className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-sm mb-1">Game Boosts</h3>
            <p className="text-xs text-gray-600">Get advantages in the Indoor Jungle game</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="bg-green-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-2">
              <Flower2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-medium text-sm mb-1">Plant Health</h3>
            <p className="text-xs text-gray-600">Improved care for your real plants</p>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
        <p className="mb-6 opacity-90">
          Connect your crypto wallet and start turning your plant care into rewards!
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <Link href="/game">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-6 py-3">
              Start Playing
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-6 py-3">
              Add My Plants
            </Button>
          </Link>
        </div>
        
        <div className="text-sm opacity-75">
          <p>💡 <strong>Recommended:</strong> MetaMask wallet for best experience</p>
          <p className="mt-1">🌱 Start with your existing plants or add new ones</p>
        </div>
      </div>
    </div>
  );
}