import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import AddPetModal from "@/components/add-pet-modal";
import { Settings, Plus, Grid3X3 } from "lucide-react";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500 mt-1">{userPets.length} pets</p>
          </div>
        </div>

        {/* Add Pet Button */}
        <button
          onClick={() => setShowAddPetModal(true)}
          className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors mb-6 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Pet</span>
        </button>
      </div>

      {/* Pets Grid */}
      <div className="border-t border-gray-200">
        <div className="flex items-center justify-center py-3 border-b border-gray-200">
          <Grid3X3 className="w-5 h-5 text-gray-900" />
          <span className="ml-2 font-semibold text-gray-900">My Pets</span>
        </div>

        {userPets.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 p-1">
            {userPets.map((pet: any) => (
              <div key={pet.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                {pet.profileImage ? (
                  <img 
                    src={pet.profileImage} 
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-xs font-semibold truncate">{pet.name}</p>
                  <p className="text-xs opacity-80">{pet.breed}</p>
                </div>
                {!pet.isPublic && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                    Private
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet!</h3>
            <p className="text-gray-600 mb-4">Add your first pet to get started on PawConnect.</p>
            <button
              onClick={() => setShowAddPetModal(true)}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Add Your First Pet
            </button>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="profile" />

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
