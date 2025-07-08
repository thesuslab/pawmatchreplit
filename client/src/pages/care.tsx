import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import AICareTab from "@/components/ai-care-tab";

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

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900">Care</h1>
      </header>

      {/* Main Content: Show AI Care Tab for each pet */}
      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-6">
        {userPets.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets found</h3>
            <p className="text-gray-600">Add a pet to see AI care recommendations.</p>
          </div>
        ) : (
          userPets.map((pet: any) => (
            <div key={pet.id} className="mb-8">
              <h2 className="text-lg font-bold mb-2">{pet.name}</h2>
              <AICareTab pet={pet} userId={user.id} />
            </div>
          ))
        )}
      </div>

      <BottomNavigation currentPage="care" />
    </div>
  );
} 