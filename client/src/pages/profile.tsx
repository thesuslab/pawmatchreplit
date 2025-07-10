import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import AddPetModal from "@/components/add-pet-modal";
import MedicalRecordsTab from "@/components/medical-records-tab";
import AICareTab from "@/components/ai-care-tab";
import EditPetModal from '@/components/edit-pet-modal';
import EditProfileModal from '@/components/edit-profile-modal';
import {  Grid3X3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, Shield, User, ChevronDown, ChevronUp, QrCode, ChevronRight, Plus, Settings, Heart, FileText, Bot, FlaskConical, Edit2, Camera, PawPrint, BadgeInfo, Hash, Cake, Utensils, ShieldCheck, User as UserIcon, Calendar as CalendarIcon, Weight } from 'lucide-react';
import { useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileProps {
  user: any;
}

export default function Profile({ user: initialUser }: ProfileProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pets');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch latest user data
  const { data: userData, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['/api/users', initialUser.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${initialUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    initialData: initialUser,
  });
  const user = userData || initialUser;

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

  if (userLoading) {
    return <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (userError) {
    return <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center text-red-500">Failed to load user profile.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setShowEditProfileModal(true)}>
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

      {/* Horizontal Pet Selector */}
      <div className="flex items-center gap-3 overflow-x-auto py-4 px-2 scrollbar-hide">
        {userPets.map((pet: any) => (
          <div
            key={pet.id}
            className={`flex flex-col items-center cursor-pointer ${selectedPet?.id === pet.id ? 'ring-2 ring-pink-400' : ''}`}
            onClick={() => setSelectedPet(pet)}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 p-1 mb-1 shadow">
              <img
                src={pet.profileImage || pet.avatar || '/default-pet.png'}
                alt={pet.name}
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <span className="text-xs font-medium text-gray-700 truncate max-w-[60px]">{pet.name}</span>
          </div>
        ))}
        {/* Add Pet Button */}
        <button
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-white ml-2 shadow hover:scale-105 transition"
          onClick={() => setShowAddPetModal(true)}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Main Pet Card - Sectioned, Icon-driven, Modern Design */}
      {selectedPet && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-4 mx-2">
          {/* Cover Photo with Camera Icon Overlay */}
          <div className="relative">
            <img
              src={selectedPet.profileImage || selectedPet.avatar || '/default-pet.png'}
              alt={selectedPet.name}
              className="w-full h-44 object-cover"
            />
            <button
              className="absolute top-3 right-3 bg-white/80 rounded-full p-2 shadow hover:bg-pink-100 transition"
              onClick={() => setShowEditPetModal(true)}
              aria-label="Edit Pet Photo"
            >
              <Camera className="w-5 h-5 text-pink-500" />
            </button>
          </div>
          {/* Basic Info Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Basic Info</h3>
              <button className="text-blue-500 text-sm font-medium hover:underline" onClick={() => setShowEditPetModal(true)}>Edit</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedPet.name && (
                <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Name</span><br/>{selectedPet.name}</span></div>
              )}
              {selectedPet.nickname && (
                <div className="flex items-center gap-2"><BadgeInfo className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Nickname</span><br/>{selectedPet.nickname}</span></div>
              )}
              {selectedPet.species && (
                <div className="flex items-center gap-2"><PawPrint className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Species</span><br/>{selectedPet.species}</span></div>
              )}
              {selectedPet.breed && (
                <div className="flex items-center gap-2"><Hash className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Breed</span><br/>{selectedPet.breed}</span></div>
              )}
              {selectedPet.gender && (
                <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Sex</span><br/>{selectedPet.gender}</span></div>
              )}
              {selectedPet.birthdate && (
                <div className="flex items-center gap-2"><Cake className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Birthdate</span><br/>{selectedPet.birthdate}</span></div>
              )}
              {selectedPet.age && (
                <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Age</span><br/>{selectedPet.age} years</span></div>
              )}
              {selectedPet.weight && (
                <div className="flex items-center gap-2"><Weight className="w-5 h-5 text-blue-400" /><span><span className="font-semibold">Weight</span><br/>{selectedPet.weight} lbs</span></div>
              )}
            </div>
          </div>
          {/* Insurance Section */}
          {(selectedPet.insuranceProvider || selectedPet.insurancePolicy) && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">Insurance</h3>
                <button className="text-blue-500 text-sm font-medium hover:underline" onClick={() => setShowEditPetModal(true)}>Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedPet.insuranceProvider && (
                  <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-400" /><span><span className="font-semibold">Provider</span><br/>{selectedPet.insuranceProvider}</span></div>
                )}
                {selectedPet.insurancePolicy && (
                  <div className="flex items-center gap-2"><Hash className="w-5 h-5 text-purple-400" /><span><span className="font-semibold">Policy #</span><br/>{selectedPet.insurancePolicy}</span></div>
                )}
              </div>
            </div>
          )}
          {/* Diet Section */}
          {selectedPet.food && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">Diet</h3>
                <button className="text-blue-500 text-sm font-medium hover:underline" onClick={() => setShowEditPetModal(true)}>Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Utensils className="w-5 h-5 text-green-400" /><span><span className="font-semibold">Food</span><br/>{selectedPet.food}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sectioned Navigation */}
      <div className="space-y-3 px-2 mb-6">
        <button
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow hover:bg-pink-50 transition"
          onClick={() => setActiveTab('medical')}
        >
          <span className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-500" /> Medical Records</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow hover:bg-pink-50 transition"
          onClick={() => setActiveTab('ai')}
        >
          <span className="flex items-center gap-3"><Bot className="w-5 h-5 text-pink-500" /> AI Recommendations</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Section Details (Tabs) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="medical" className="mt-0">
          {selectedPet && (
            <div className="bg-white/80 dark:bg-zinc-900/70 rounded-2xl shadow p-4 my-4 mx-2">
              <MedicalRecordsTab pet={selectedPet} userId={user.id} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="ai" className="mt-0">
          {selectedPet && (
            <div className="bg-white/80 dark:bg-zinc-900/70 rounded-2xl shadow p-4 my-4 mx-2">
              <AICareTab pet={selectedPet} userId={user.id} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Add Pet Button */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 text-white rounded-full p-4 shadow-lg z-50 hover:scale-110 transition"
        onClick={() => setShowAddPetModal(true)}
        aria-label="Add Pet"
      >
        <Plus className="w-7 h-7" />
      </button>
      <BottomNavigation currentPage="profile" />
      <AnimatePresence>
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
        {showEditProfileModal && (
          <EditProfileModal
            isOpen={showEditProfileModal}
            onClose={() => {
              setShowEditProfileModal(false);
              queryClient.invalidateQueries({ queryKey: ['/api/users', user.id] });
            }}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
