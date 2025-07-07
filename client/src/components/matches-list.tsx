import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";

interface MatchesListProps {
  user: any;
}

export default function MatchesList({ user }: MatchesListProps) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/matches/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
        <p className="text-gray-600">Keep swiping to find your perfect pet matches!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match: any) => {
        const userPets = match.pet1?.userId === user.id ? [match.pet1] : [match.pet2];
        const matchedPet = match.pet1?.userId === user.id ? match.pet2 : match.pet1;
        
        return (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-4">
              {/* User's Pet */}
              <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full overflow-hidden">
                {userPets[0]?.photos?.[0] ? (
                  <img 
                    src={userPets[0].photos[0]} 
                    alt={userPets[0].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                    {userPets[0]?.name?.[0] || "P"}
                  </div>
                )}
              </div>
              
              {/* Heart Icon */}
              <Heart className="w-6 h-6 text-pink-500 fill-current" />
              
              {/* Matched Pet */}
              <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full overflow-hidden">
                {matchedPet?.photos?.[0] ? (
                  <img 
                    src={matchedPet.photos[0]} 
                    alt={matchedPet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                    {matchedPet?.name?.[0] || "P"}
                  </div>
                )}
              </div>
              
              {/* Pet Info */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {userPets[0]?.name} & {matchedPet?.name}
                </h4>
                <p className="text-sm text-gray-600">New match!</p>
              </div>
              
              {/* Chat Button */}
              <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}