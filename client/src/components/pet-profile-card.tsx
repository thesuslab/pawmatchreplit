import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PetProfileCardProps {
  pet: any;
  currentUser: any;
}

export default function PetProfileCard({ pet, currentUser }: PetProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/follows/${currentUser.id}/${pet.id}`);
      } else {
        await apiRequest("POST", "/api/follows", {
          followerId: currentUser.id,
          followedPetId: pet.id,
        });
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: `You are ${isFollowing ? "no longer following" : "now following"} ${pet.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pets/public'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const getTags = () => {
    const tags = [];
    if (pet.age < 2) tags.push({ label: "Young", color: "bg-blue-100 text-blue-600" });
    if (pet.gender === "male") tags.push({ label: "Male", color: "bg-purple-100 text-purple-600" });
    if (pet.gender === "female") tags.push({ label: "Female", color: "bg-pink-100 text-pink-600" });
    tags.push({ label: "Friendly", color: "bg-green-100 text-green-600" });
    return tags;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-pink-200 to-blue-200 rounded-t-xl overflow-hidden">
          {pet.photos && pet.photos.length > 0 ? (
            <img 
              src={pet.photos[0]} 
              alt={pet.name} 
              className="w-full h-full object-cover"
            />
          ) : pet.profileImage ? (
            <img 
              src={pet.profileImage} 
              alt={pet.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          )}
          
          {/* Photo indicators */}
          {pet.photos && pet.photos.length > 1 && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {pet.photos.slice(0, 3).map((_: any, index: number) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
          <Heart className="w-5 h-5 text-pink-500" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{pet.name}</h3>
          <span className="text-sm text-gray-600">{pet.age} year{pet.age !== 1 ? 's' : ''} old</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{pet.breed} • {pet.gender}</p>
        
        {pet.bio && (
          <p className="text-sm mb-4">{pet.bio}</p>
        )}
        
        {/* Pet Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getTags().map((tag, index) => (
            <span 
              key={index}
              className={`px-3 py-1 text-xs rounded-full ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              isFollowing 
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {followMutation.isPending ? "..." : (isFollowing ? "Following" : "Connect")}
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
