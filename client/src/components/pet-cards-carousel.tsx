import { Flame } from 'lucide-react';

interface PetCardsCarouselProps {
  pets: Array<{
    id: number;
    name: string;
    breed: string;
    age: string;
    avatar?: string;
    emoji?: string;
    color?: string;
    progress: number;
    streakDays: number;
    nextTask?: string;
  }>;
  selectedPetId: number;
  onSelectPet: (petId: number) => void;
}

export default function PetCardsCarousel({ pets, selectedPetId, onSelectPet }: PetCardsCarouselProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 px-1 mb-4">
      {pets.map((pet) => (
        <div
          key={pet.id}
          onClick={() => onSelectPet(pet.id)}
          className={`min-w-[180px] max-w-[200px] rounded-2xl p-4 cursor-pointer transition-all duration-300 relative shadow-md border-2 ${selectedPetId === pet.id ? 'border-blue-400 scale-105 ring-4 ring-blue-200' : 'border-transparent hover:scale-102'}`}
          style={{ background: pet.color ? `linear-gradient(to bottom right, ${pet.color})` : 'linear-gradient(to bottom right, #fce7f3, #dbeafe)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">
              {pet.emoji || (pet.avatar ? <img src={pet.avatar} alt={pet.name} className="w-10 h-10 rounded-full" /> : '🐾')}
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">{pet.name}</div>
              <div className="text-xs text-gray-700">{pet.breed}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 relative">
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" stroke="#f3f4f6" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="18" stroke="#60a5fa" strokeWidth="4" fill="none" strokeDasharray={113} strokeDashoffset={113 - (pet.progress / 100) * 113} style={{ transition: 'stroke-dashoffset 0.5s' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-lg">{pet.progress}%</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                <Flame className="w-4 h-4" /> {pet.streakDays}d streak
              </div>
              <div className="text-xs text-gray-700">Next: {pet.nextTask || '—'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 