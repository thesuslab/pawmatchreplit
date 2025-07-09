import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import { Search } from "lucide-react";
import { useEffect, useState } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';

interface DiscoverProps {
  user: any;
}

export default function Discover({ user }: DiscoverProps) {
  const queryClient = useQueryClient();
  const { data: publicPets = [], isLoading } = useQuery({
    queryKey: ['/api/pets/public'],
    queryFn: async () => {
      const response = await fetch('/api/pets/public');
      if (!response.ok) throw new Error('Failed to fetch public pets');
      return response.json();
    }
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['/api/follows/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/follows/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch follows');
      return response.json();
    }
  });

  // Get set of followed pet IDs
  const followedPetIds = new Set(follows.map((f: any) => f.followedPetId));
  const filteredPets = publicPets.filter((pet: any) => !followedPetIds.has(pet.id));

  const handleFollowChange = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/follows/user', user.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/pets/public'] });
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-bold text-gray-900">Discover</h1>
        </div>
      </header>

      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={async () => {
        await queryClient.invalidateQueries({ queryKey: ['/api/pets/public'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/follows/user', user.id] });
      }}>
        <div className="flex-1 overflow-y-auto pb-20 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredPets.length > 0 ? (
            <div className="space-y-6">
              {filteredPets.map((pet: any) => (
                <PetProfileCard
                  key={pet.id}
                  pet={pet}
                  currentUser={user}
                  isInitiallyFollowing={false}
                  onFollowChange={handleFollowChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets to discover</h3>
              <p className="text-gray-600">Check back later for new furry friends!</p>
            </div>
          )}
        </div>
      </PullToRefresh>

      <BottomNavigation currentPage="discover" />
    </div>
  );
}
