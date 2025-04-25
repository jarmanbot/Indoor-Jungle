import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flower2 as Plant, Tag, ShoppingBag, ArrowLeft, Info } from "lucide-react";

interface VirtualPlant {
  id: number;
  name: string;
  plantType: string;
  rarity: string;
  health: number;
  growthStage: number;
  tokenValue: number;
  isNFT: boolean;
  imageUrl: string | null;
}

interface MarketplaceListing {
  id: number;
  plantId: number;
  plant: VirtualPlant;
  sellerId: number;
  price: number;
  listedAt: string;
}

export default function GameMarketplace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("buy");
  
  // Query marketplace listings
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/game/marketplace/listings'],
    enabled: activeTab === "buy",
  });
  
  // Query player's plants (for selling)
  const { data: playerPlants, isLoading: plantsLoading } = useQuery({
    queryKey: ['/api/game/plants/owned'],
    enabled: activeTab === "sell",
  });
  
  // Purchase plant mutation
  const purchaseMutation = useMutation({
    mutationFn: (listingId: number) =>
      apiRequest('POST', `/api/game/marketplace/purchase/${listingId}`),
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "You've successfully purchased the plant!",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/game/marketplace/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game/plants/owned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game/player'] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase the plant",
        variant: "destructive",
      });
    }
  });
  
  // List plant for sale mutation
  const listForSaleMutation = useMutation({
    mutationFn: ({ plantId, price }: { plantId: number; price: number }) =>
      apiRequest('POST', '/api/game/marketplace/list', { plantId, price }),
    onSuccess: () => {
      toast({
        title: "Plant Listed",
        description: "Your plant has been listed for sale!",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/game/marketplace/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game/plants/owned'] });
    },
    onError: (error: any) => {
      toast({
        title: "Listing Failed",
        description: error.message || "Failed to list plant for sale",
        variant: "destructive",
      });
    }
  });
  
  const handlePurchase = (listingId: number) => {
    purchaseMutation.mutate(listingId);
  };
  
  const handleListForSale = (plantId: number, price: number) => {
    listForSaleMutation.mutate({ plantId, price });
  };
  
  // Get rarity display properties
  const getRarityProps = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { color: 'bg-slate-100 text-slate-800', label: 'Common' };
      case 'uncommon':
        return { color: 'bg-green-100 text-green-800', label: 'Uncommon' };
      case 'rare':
        return { color: 'bg-blue-100 text-blue-800', label: 'Rare' };
      case 'epic':
        return { color: 'bg-purple-100 text-purple-800', label: 'Epic' };
      case 'legendary':
        return { color: 'bg-amber-100 text-amber-800', label: 'Legendary' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: rarity };
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/game">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Plant Marketplace</h1>
      </div>
      
      <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="buy">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Buy Plants
          </TabsTrigger>
          <TabsTrigger value="sell">
            <Tag className="mr-2 h-4 w-4" />
            Sell Plants
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy" className="space-y-4">
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading marketplace...</span>
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show sample listings for now */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Monstera Deliciosa</CardTitle>
                    <Badge className={`${getRarityProps('uncommon').color}`}>
                      {getRarityProps('uncommon').label}
                    </Badge>
                  </div>
                  <CardDescription>Indoor Tropical Plant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    <Plant className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-medium">95/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="font-medium">Stage 3</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold">150 Tokens</p>
                  </div>
                  <Button onClick={() => handlePurchase(1)} disabled={purchaseMutation.isPending}>
                    {purchaseMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buying...
                      </>
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Snake Plant</CardTitle>
                    <Badge className={`${getRarityProps('common').color}`}>
                      {getRarityProps('common').label}
                    </Badge>
                  </div>
                  <CardDescription>Low Maintenance Succulent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    <Plant className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-medium">100/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="font-medium">Stage 2</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold">50 Tokens</p>
                  </div>
                  <Button onClick={() => handlePurchase(2)} disabled={purchaseMutation.isPending}>
                    {purchaseMutation.isPending ? "Buying..." : "Buy Now"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Variegated Monstera</CardTitle>
                    <Badge className={`${getRarityProps('legendary').color}`}>
                      {getRarityProps('legendary').label}
                    </Badge>
                  </div>
                  <CardDescription>Rare Tropical Plant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    <Plant className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-medium">90/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="font-medium">Stage 1</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold">2500 Tokens</p>
                  </div>
                  <Button onClick={() => handlePurchase(3)} disabled={purchaseMutation.isPending}>
                    {purchaseMutation.isPending ? "Buying..." : "Buy Now"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">No Plants Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are no plants listed for sale at the moment.
                </p>
                <p className="text-sm">
                  Check back later or list some of your own plants to sell!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sell" className="space-y-4">
          {plantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading your plants...</span>
            </div>
          ) : playerPlants && playerPlants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would map through player plants */}
              {/* For now, just show sample UI */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Your Monstera</CardTitle>
                    <Badge className={`${getRarityProps('uncommon').color}`}>
                      {getRarityProps('uncommon').label}
                    </Badge>
                  </div>
                  <CardDescription>Indoor Tropical Plant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    <Plant className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-medium">98/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Value</p>
                      <p className="font-medium">150 Tokens</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Set Price</p>
                    <p className="text-xl font-bold">
                      <input 
                        type="number" 
                        defaultValue={150}
                        min={1}
                        className="w-24 border rounded px-2 py-1"
                      />
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleListForSale(1, 150)} 
                    disabled={listForSaleMutation.isPending}
                  >
                    {listForSaleMutation.isPending ? "Listing..." : "List for Sale"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Plant className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">No Plants to Sell</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any plants that can be sold.
                </p>
                <Link href="/game">
                  <Button>
                    Get Your First Plant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}