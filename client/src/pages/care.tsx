import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
      <div className="px-4 py-3">
        <Carousel opts={{ align: "center", loop: false }}>
          <CarouselContent>
            {userPets.map((pet: any) => (
              <CarouselItem key={pet.id} className="px-2">
                <div
                  className={`max-w-[320px] mx-auto ${selectedPet?.id === pet.id ? 'ring-2 ring-pink-400 scale-105' : ''}`}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <PetProfileCard pet={pet} currentUser={user} expandable={false} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* AI Care Tab for Selected Pet */}
      <div className="px-4 mt-4">
        {selectedPet && <AICareTab pet={selectedPet} userId={user.id} />}
      </div>

      <BottomNavigation currentPage="care" />
    </div>
  );
} 