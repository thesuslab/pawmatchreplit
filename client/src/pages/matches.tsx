import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Heart, MessageCircle, Calendar } from "lucide-react";

interface MatchesProps {
  user: any;
}

export default function Matches({ user }: MatchesProps) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/matches/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    }
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const matchDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Heart className="w-6 h-6 text-pink-500" />
          <h1 className="text-xl font-bold text-gray-900">Matches</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : matches.length > 0 ? (
          <div className="p-4 space-y-4">
            {matches.map((match: any) => {
              // Determine which pet to show (the one that's not the user's)
              const userPets = match.pet1?.userId === user.id ? [match.pet1] : [match.pet2];
              const matchedPet = match.pet1?.userId === user.id ? match.pet2 : match.pet1;
              
              return (
                <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-600">New Match!</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(match.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* User's Pet */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full overflow-hidden mb-2">
                          {userPets[0]?.photos?.[0] ? (
                            <img 
                              src={userPets[0].photos[0]} 
                              alt={userPets[0].name}
                              className="w-full h-full object-cover"
                            />
                          ) : userPets[0]?.profileImage ? (
                            <img 
                              src={userPets[0].profileImage} 
                              alt={userPets[0].name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                              {userPets[0]?.name?.[0] || "P"}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-900">{userPets[0]?.name}</span>
                      </div>
                      
                      {/* Heart Icon */}
                      <div className="flex-1 flex justify-center">
                        <Heart className="w-8 h-8 text-pink-500 fill-current" />
                      </div>
                      
                      {/* Matched Pet */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full overflow-hidden mb-2">
                          {matchedPet?.photos?.[0] ? (
                            <img 
                              src={matchedPet.photos[0]} 
                              alt={matchedPet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : matchedPet?.profileImage ? (
                            <img 
                              src={matchedPet.profileImage} 
                              alt={matchedPet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                              {matchedPet?.name?.[0] || "P"}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-900">{matchedPet?.name}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 text-center mb-3">
                        You and {matchedPet?.name}'s owner both liked each other!
                      </p>
                      
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>Say Hello</span>
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600">Start swiping to find your perfect pet match!</p>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="matches" />
    </div>
  );
}