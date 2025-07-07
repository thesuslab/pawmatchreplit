import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import StoriesHighlights from "@/components/stories-highlights";
import PetPost from "@/components/pet-post";
import AddPetModal from "@/components/add-pet-modal";
import { Heart, MessageCircle, Send } from "lucide-react";

interface HomeProps {
  user: any;
}

export default function Home({ user }: HomeProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts/feed', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/feed/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h1 className="text-xl font-bold text-gray-900">PawConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Stories Highlights */}
      <StoriesHighlights pets={userPets} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post: any) => (
            <PetPost key={post.id} post={post} currentUser={user} />
          ))
        ) : (
          <div className="text-center py-8 px-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet!</h3>
            <p className="text-gray-600 mb-4">Follow some pets or create your first post to get started.</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddPetModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </button>

      <BottomNavigation currentPage="home" />

      {showAddPetModal && (
        <AddPetModal
          isOpen={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          userId={user.id}
        />
      )}
    </div>
  );
}
