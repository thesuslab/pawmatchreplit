import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import AddPetModal from "@/components/add-pet-modal";
import MedicalRecordsTab from "@/components/medical-records-tab";
import AICareTab from "@/components/ai-care-tab";
import EditPetModal from '@/components/edit-pet-modal';
import { Settings, Plus, Grid3X3, Heart, FileText, Bot, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pets');

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
              {user.name ? user.name[0] : (user.firstName && user.lastName ? user.firstName[0] + user.lastName[0] : user.email[0])}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email)}
            </h2>
            <p className="text-gray-600">@{user.username || user.name}</p>
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

      {/* Pet Management Tabs */}
      <div className="border-t border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pets" className="flex items-center space-x-2">
              <Grid3X3 className="w-4 h-4" />
              <span>My Pets</span>
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Medical Records</span>
            </TabsTrigger>
            <TabsTrigger value="care" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>AI Care</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="mt-0">
            {userPets.length > 0 ? (
              <div className="space-y-4 p-4">
                {userPets.map((pet: any) => (
                  <Card
                    key={pet.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedPet?.id === pet.id ? 'ring-2 ring-pink-500 bg-pink-50' : ''}`}
                    onClick={() => setSelectedPet(pet)}
                  >
                    <CardContent className="p-4 relative">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                          {pet.profileImage || pet.avatar ? (
                            <img 
                              src={pet.profileImage || pet.avatar} 
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
                              <Heart className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{pet.name}</h3>
                          <p className="text-gray-600">{pet.breed} • {pet.gender}</p>
                          <p className="text-sm text-gray-500">{pet.age} years old</p>
                          {pet.species && <p className="text-sm text-gray-500">{pet.species}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); setSelectedPet(pet); setActiveTab('medical'); }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Records
                          </Button>
                          {selectedPet?.id === pet.id && (
                            <button
                              className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                              onClick={e => { e.stopPropagation(); setShowEditPetModal(true); }}
                              aria-label="Edit Pet"
                            >
                              <Pencil className="w-5 h-5 text-pink-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pets yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first pet to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="medical" className="mt-0">
            {selectedPet ? (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Medical Records for {selectedPet.name}</h3>
                  <p className="text-gray-600">{selectedPet.breed} • {selectedPet.age} years old</p>
                </div>
                <MedicalRecordsTab pet={selectedPet} userId={user.id} />
              </div>
            ) : userPets.length > 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a pet to view medical records</p>
                <p className="text-sm text-gray-400 mt-1">Choose a pet from the "My Pets" tab first</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pets available</p>
                <p className="text-sm text-gray-400 mt-1">Add a pet first to manage medical records</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="care" className="mt-0">
            {selectedPet ? (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">AI Care Assistant for {selectedPet.name}</h3>
                  <p className="text-gray-600">{selectedPet.breed} • {selectedPet.age} years old</p>
                </div>
                <AICareTab pet={selectedPet} userId={user.id} />
              </div>
            ) : userPets.length > 0 ? (
              <div className="p-8 text-center">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a pet to access AI care recommendations</p>
                <p className="text-sm text-gray-400 mt-1">Choose a pet from the "My Pets" tab first</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pets available</p>
                <p className="text-sm text-gray-400 mt-1">Add a pet first to get AI care recommendations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation currentPage="profile" />

      {showAddPetModal && (
        <AddPetModal
          isOpen={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          userId={user.id}
        />
      )}
      {showEditPetModal && selectedPet && (
        <EditPetModal
          isOpen={showEditPetModal}
          onClose={() => setShowEditPetModal(false)}
          pet={selectedPet}
          userId={user.id}
        />
      )}
    </div>
  );
}
