import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import AICareTab from "@/components/ai-care-tab";
import { useToast } from "@/hooks/use-toast";

interface CareProps {
  user: any;
}

export default function Care({ user }: CareProps) {
  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const selectedPet = userPets.find((pet: any) => pet.id === selectedPetId) || userPets[0];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900">Care</h1>
      </header>

      {/* Pet Selection Row */}
      <div className="flex overflow-x-auto gap-4 px-4 py-3 scrollbar-hide">
        {userPets.map((pet: any) => (
          <div
            key={pet.id}
            className={`min-w-[180px] max-w-[200px] cursor-pointer transition-transform ${selectedPet?.id === pet.id ? 'ring-2 ring-pink-400 scale-105' : 'hover:scale-105'}`}
            onClick={() => setSelectedPetId(pet.id)}
          >
            <PetProfileCard pet={pet} currentUser={user} />
          </div>
        ))}
      </div>

      {/* AI Care Tab for Selected Pet */}
      <div className="px-4 mt-4">
        {selectedPet && <AICareTab pet={selectedPet} userId={user.id} />}
      </div>

      <BottomNavigation currentPage="care" />
    </div>
  );
} 