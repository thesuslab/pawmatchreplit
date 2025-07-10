import { Flame, Crown, Heart, Star } from 'lucide-react';

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
  const samplePets = pets.length > 0 ? pets : [
    {
      id: 1,
      name: "Luna",
      breed: "Golden Retriever",
      age: "2 years",
      emoji: "🐕",
      color: "from-amber-400 to-orange-500",
      progress: 85,
      streakDays: 12,
      nextTask: "Evening walk"
    },
    {
      id: 2,
      name: "Milo",
      breed: "British Shorthair",
      age: "3 years",
      emoji: "🐱",
      color: "from-purple-400 to-pink-500",
      progress: 92,
      streakDays: 7,
      nextTask: "Feeding time"
    },
    {
      id: 3,
      name: "Coco",
      breed: "French Bulldog",
      age: "1 year",
      emoji: "🐶",
      color: "from-green-400 to-teal-500",
      progress: 67,
      streakDays: 3,
      nextTask: "Training session"
    }
  ];

  return (
    <div className="relative px-4 py-6 bg-background-app">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-12 right-12 w-20 h-20 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-8 left-1/3 w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {samplePets.map((pet, index) => {
          const isSelected = selectedPetId === pet.id;
          const isTopPerformer = pet.progress > 90;
          const hasLongStreak = pet.streakDays > 10;
          
          return (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className={`
                relative min-w-[220px] max-w-[240px] rounded-3xl p-6 cursor-pointer 
                transition-all duration-500 ease-out
                ${isSelected 
                  ? 'scale-105 shadow-2xl shadow-primary/25 ring-4 ring-primary/20' 
                  : 'hover:scale-102 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/5'
                }
                ${isSelected ? 'z-10' : 'z-0'}
                bg-gradient-to-br ${pet.color || 'from-primary to-secondary'}
              `}
              style={{
                boxShadow: isSelected 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                  : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 glass rounded-3xl"></div>
              
              {/* Top badges */}
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  {isTopPerformer && (
                    <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-sm rounded-full px-2 py-1 border border-yellow-400/30">
                      <Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">Top</span>
                    </div>
                  )}
                  {hasLongStreak && (
                    <div className="flex items-center gap-1 bg-orange-400/20 backdrop-blur-sm rounded-full px-2 py-1 border border-orange-400/30">
                      <Star className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">Hot</span>
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full p-2 border border-white/30 dark:border-white/10">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Pet avatar and info */}
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg border border-white/30 dark:border-white/10">
                    {pet.emoji || (pet.avatar ? <img src={pet.avatar} alt={pet.name} className="w-14 h-14 rounded-full object-cover" /> : '🐾')}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white drop-shadow-lg">{pet.name}</h3>
                  <p className="text-sm text-white/90 font-medium drop-shadow-md">{pet.breed}</p>
                  <p className="text-xs text-white/80 drop-shadow-md">{pet.age}</p>
                </div>
              </div>

              {/* Progress section */}
              <div className="relative z-10 space-y-4">
                {/* Circular progress */}
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div className="w-16 h-16 relative">
                      <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          stroke="rgba(255,255,255,0.3)" 
                          strokeWidth="3" 
                          fill="none" 
                        />
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          stroke="white" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray={100.53} 
                          strokeDashoffset={100.53 - (pet.progress / 100) * 100.53}
                          className="transition-all duration-1000 ease-out drop-shadow-lg"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-bold text-white text-sm drop-shadow-lg">{pet.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Streak */}
                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                    <Flame className="w-4 h-4 text-orange-400 drop-shadow-md" />
                    <span className="text-sm font-bold text-white drop-shadow-md">{pet.streakDays}</span>
                    <span className="text-xs text-white/90 drop-shadow-md">days</span>
                  </div>
                </div>

                {/* Next task */}
                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/80 font-medium drop-shadow-md">Next up</p>
                      <p className="text-sm text-white font-semibold drop-shadow-md">{pet.nextTask || 'Free time!'}</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center border border-white/30 dark:border-white/10">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce drop-shadow-md"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating particles for selected card */}
              {isSelected && (
                <>
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                  <div className="absolute bottom-6 left-4 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 right-2 w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Scroll indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {samplePets.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === samplePets.findIndex(p => p.id === selectedPetId)
                ? 'bg-primary w-6'
                : 'bg-muted-foreground w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}