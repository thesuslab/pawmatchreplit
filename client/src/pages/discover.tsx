import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import { Search } from "lucide-react";

interface DiscoverProps {
  user: any;
}

export default function Discover({ user }: DiscoverProps) {
  const { data: publicPets = [], isLoading } = useQuery({
    queryKey: ['/api/pets/public'],
    queryFn: async () => {
      const response = await fetch('/api/pets/public');
      if (!response.ok) throw new Error('Failed to fetch public pets');
      return response.json();
    }
  });

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-bold text-gray-900">Discover</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : publicPets.length > 0 ? (
          <div className="space-y-6">
            {publicPets.map((pet: any) => (
              <PetProfileCard key={pet.id} pet={pet} currentUser={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets to discover</h3>
            <p className="text-gray-600">Check back later for new furry friends!</p>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="discover" />
    </div>
  );
}
