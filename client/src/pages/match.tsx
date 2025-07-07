import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, X, MapPin, Calendar } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MatchProps {
  user: any;
}

export default function Match({ user }: MatchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: potentialMatches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/potential', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/matches/potential/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch potential matches');
      return response.json();
    }
  });

  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ direction, petId }: { direction: string; petId: number }) => {
      if (userPets.length === 0) {
        throw new Error("You need to add a pet first!");
      }
      
      const response = await apiRequest("POST", "/api/matches", {
        userId: user.id,
        petId1: userPets[0].id, // Use first pet for now
        petId2: petId,
        swipeDirection: direction
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.isMatch) {
        toast({
          title: "It's a Match! 🎉",
          description: "You and this pet owner both liked each other!",
        });
      }
      
      setCurrentIndex(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['/api/matches/potential', user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record swipe",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= potentialMatches.length) return;
    
    const currentPet = potentialMatches[currentIndex];
    swipeMutation.mutate({ 
      direction, 
      petId: currentPet.id 
    });
  };

  if (userPets.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
          <h1 className="text-xl font-bold text-gray-900">Find Matches</h1>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a Pet First</h3>
            <p className="text-gray-600 mb-4">You need to add at least one pet to start finding matches.</p>
          </div>
        </div>
        
        <BottomNavigation currentPage="match" />
      </div>
    );
  }

  const currentPet = potentialMatches[currentIndex];
  const hasMorePets = currentIndex < potentialMatches.length;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900">Find Matches</h1>
        <div className="text-sm text-gray-500">
          {potentialMatches.length - currentIndex} left
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : !hasMorePets ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No More Pets</h3>
            <p className="text-gray-600">You've seen all available pets. Check back later for new friends!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Pet Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Pet Photos */}
              <div className="relative h-96">
                {currentPet.photos && currentPet.photos.length > 0 ? (
                  <img 
                    src={currentPet.photos[0]} 
                    alt={currentPet.name}
                    className="w-full h-full object-cover"
                  />
                ) : currentPet.profileImage ? (
                  <img 
                    src={currentPet.profileImage} 
                    alt={currentPet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                )}
                
                {/* Photo indicators */}
                {currentPet.photos && currentPet.photos.length > 1 && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {currentPet.photos.map((_: any, index: number) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pet Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">{currentPet.name}</h2>
                  <span className="text-lg text-gray-600">{currentPet.age}</span>
                </div>
                
                <p className="text-gray-600 mb-3">{currentPet.breed} • {currentPet.gender}</p>
                
                {currentPet.bio && (
                  <p className="text-gray-800 mb-4">{currentPet.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>2 miles away</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Active today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6 mt-6">
              <button 
                onClick={() => handleSwipe("left")}
                disabled={swipeMutation.isPending}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <X className="w-8 h-8 text-gray-600" />
              </button>
              
              <button 
                onClick={() => handleSwipe("right")}
                disabled={swipeMutation.isPending}
                className="w-16 h-16 bg-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="match" />
    </div>
  );
}