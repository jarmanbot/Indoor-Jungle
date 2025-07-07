import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Flower2 as Plant, ShoppingBag, Flower, Trophy, Wallet } from "lucide-react";

export default function GameDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Query game player data
  const { data: playerData, isLoading: playerLoading } = useQuery({
    queryKey: ['/api/game/player'],
    // Only try to fetch if we have a wallet connected
    enabled: walletConnected,
  });

  // Connect wallet function
  const connectWallet = async () => {
    setConnectingWallet(true);
    
    try {
      // Check if window.ethereum is available (MetaMask)
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          
          // Register wallet with our backend
          await apiRequest('POST', '/api/game/connect-wallet', { 
            walletAddress: accounts[0] 
          });
          
          toast({
            title: "Wallet Connected",
            description: "Your wallet has been connected successfully!",
          });
        }
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask extension to use the Game features.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(false);
    }
  };

  // Handle wallet connection status on load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress("");
        } else {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      });
    }
  }, []);

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading game data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Indoor Jungle</h1>
          <p className="text-muted-foreground">Buy, sell, and care for virtual plants with LVS tokens</p>
        </div>
        
        {!walletConnected ? (
          <Button onClick={connectWallet} disabled={connectingWallet}>
            {connectingWallet ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <Wallet className="mr-2 h-4 w-4" />
              {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
            </Badge>
            {playerData && (
              <Badge className="px-3 py-1">
                {playerData.tokenBalance} Tokens
              </Badge>
            )}
          </div>
        )}
      </div>

      {!walletConnected ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to your virtual plant world</CardTitle>
            <CardDescription>
                  Connect your wallet and enter your virtual indoor jungle. Play the game and start earning LVS tokens while learning how to care for your real plants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  In Indoor Jungle the game, you'll start off with one pot plant in small rundown rented apartment and work your way 
                  up to owning luxury mansions and apartment towers while collecting, growing, and trading plants. Once you've conquered the game on earth you'll be ready to take on the challenge of exploring the galaxies in search for plant species that are out of this world.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plant Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  Buy, grow, and care for unique virtual plants
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Upgrades</CardTitle>
                </CardHeader>
                <CardContent>
                  Upgrade your living space to grow more plants
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">NFT Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  Trade rare plants with other players
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={connectWallet} disabled={connectingWallet} className="w-full">
              {connectingWallet ? "Connecting..." : "Connect Wallet to Start"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="home">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="my-plants">
              <Plant className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">My Plants</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="property">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Property</span>
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-4">
            {playerData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Your Property</CardTitle>
                    <CardDescription>
                      {playerData.propertyType.replace(/_/g, ' ')} (Level {playerData.propertyLevel})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                      <Home className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm">
                      Space for {playerData.maxPlants} plants
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("property")}>
                      Manage Property
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Plant Collection</CardTitle>
                    <CardDescription>
                      Your virtual plants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">0</p>
                    <p className="text-sm">Plants in your collection</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("my-plants")}>
                      View Plants
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Marketplace</CardTitle>
                    <CardDescription>
                      Buy and sell plants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">{playerData.tokenBalance}</p>
                    <p className="text-sm">Available tokens</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("marketplace")}>
                      Visit Marketplace
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading your virtual world...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-plants">
            <Card>
              <CardHeader>
                <CardTitle>My Virtual Plants</CardTitle>
                <CardDescription>Manage and care for your collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Flower className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Plants Yet</h3>
                  <p className="text-muted-foreground">
                    Visit the marketplace to purchase your first plant
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setActiveTab("marketplace")}>
                  Shop for Plants
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Plant Marketplace</CardTitle>
                <CardDescription>Buy and sell virtual plants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Marketplace Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're working on bringing you a vibrant marketplace for plant trading!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="property">
            <Card>
              <CardHeader>
                <CardTitle>Your Property</CardTitle>
                <CardDescription>
                  {playerData?.propertyType.replace(/_/g, ' ')} (Level {playerData?.propertyLevel})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                  <Home className="h-24 w-24 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plant Capacity</p>
                    <p className="text-xl font-medium">{playerData?.maxPlants} plants</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Upgrade Cost</p>
                    <p className="text-xl font-medium">1000 tokens</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Upgrade Path</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md flex justify-between items-center">
                      <span>Owned Condo</span>
                      <Button size="sm" disabled={playerData?.tokenBalance < 1000}>
                        Upgrade (1000 tokens)
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md flex justify-between items-center opacity-50">
                      <span>Small House</span>
                      <Button size="sm" disabled>
                        Upgrade (2500 tokens)
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md flex justify-between items-center opacity-50">
                      <span>Large House</span>
                      <Button size="sm" disabled>
                        Upgrade (5000 tokens)
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md flex justify-between items-center opacity-50">
                      <span>Luxury Mansion</span>
                      <Button size="sm" disabled>
                        Upgrade (10000 tokens)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Track your progress and earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Achievements Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Complete tasks and earn special rewards!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">
            Return to Plant Care App
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Add typings for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, listener: (...args: any[]) => void) => void;
    };
  }
}