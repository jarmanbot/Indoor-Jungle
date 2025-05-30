
  </div>
</div>import { Link } from "wouter";
import { 
  Leaf, 
  Sprout, 
  Flower2, 
  QrCode, 
  Coins, 
  Medal, 
  ArrowRight,
  Gamepad 
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

export default function GrowToEarn() {
  return (
    <div className="pb-20">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-b-lg">
        <div className="flex items-center mb-4">
          <Sprout className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">Grow to Earn</h1>
        </div>
        <p className="mb-4">
           Grow to Earn connects your real world plant babies to the virtual world. Connect your crypto wallet to the INDOOR JUNGLE app, register your plant pot via the QR code and your first plant NFT will be ready for you in game. Complete tasks in the game to upgrade your virtual plants and earn LVS tokens, the in game currency. The more you upgrade your NFT's you can earn more LVS and bonuses. Buy and sell your virtual plants, pots and other plant care accesory NFTs to earn LVS. Use LVS in game to buy even more plant NFTs or buy collecable plant pots for your plant babies to earn even more in game bonuses. You can even withdraw your LVS and swap them for other crytocurrencies like Bitcoin, Etherum or Ripple turning your in game progress into assetts you can trade in Crypto exchanges or store in your crypto wallets as investments for your future. *we recommend and support MetaMask.   
          
        </p>
        <div className="flex justify-between items-center mt-6">
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
              <Leaf className="h-6 w-6" />
            </div>
            <p className="text-xs">Real Plants</p>
          </div>
          <ArrowRight className="h-5 w-5" />
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="text-xs">NFT Planter</p>
          </div>
          <ArrowRight className="h-5 w-5" />
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
              <Coins className="h-6 w-6" />
            </div>
            <p className="text-xs">LVS Tokens</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                Register Your Plant Pot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Add your real plants to the Plant Care app and maintain their care records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                Mint NFT Planters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Purchase and mint digital NFT planters that link to your real plants. Different rarities offer different benefits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                Care for Your Plants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Successfully care for your plants in real life to generate virtual benefits. The app tracks your care activities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                Earn LVS Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Earn LVS tokens based on your plant care success. More plants and rarer NFT planters generate more tokens.
              </p>
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
      <div className="p-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start?</CardTitle>
            <CardDescription>
              Connect your crypto wallet to the INDOOR JUNGLE app, register your plant pot via the QR code and your first NFT will be ready for you in game *we recommend and support MetaMask           </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4">
              <Link href="/game">
                <Button className="bg-green-600 hover:bg-green-700">
                  Play Game
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  View My Plants
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-500 justify-center">
            Requires a connected cryptocurrency wallet
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}