import { Plus } from "lucide-react";

interface StoriesHighlightsProps {
  pets: any[];
}

export default function StoriesHighlights({ pets }: StoriesHighlightsProps) {
  if (!pets || pets.length === 0) return null;
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="mb-2 text-xs font-semibold text-gray-700">Your Pets</div>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {pets.map((pet) => (
          <div key={pet.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-blue-500 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                {pet.profileImage ? (
                  <img 
                    src={pet.profileImage} 
                    alt={pet.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">{pet.name[0]}</span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 max-w-[64px] truncate">{pet.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
