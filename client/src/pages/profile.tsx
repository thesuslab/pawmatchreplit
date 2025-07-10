import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import AddPetModal from "@/components/add-pet-modal";
import MedicalRecordsTab from "@/components/medical-records-tab";
import AICareTab from "@/components/ai-care-tab";
import EditPetModal from '@/components/edit-pet-modal';
import EditProfileModal from '@/components/edit-profile-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, Shield, User, ChevronDown, ChevronUp, QrCode, ChevronRight, Plus, Settings, Heart, FileText, Bot, FlaskConical, Edit2, Camera, PawPrint, BadgeInfo, Hash, Cake, Utensils, ShieldCheck, User as UserIcon, Calendar as CalendarIcon, Weight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskDashboard from '@/components/task-dashboard';
import { generateTaskModulesFromPetCareData, TaskModule } from '@/components/ai-care-tab';

interface ProfileProps {
  user: any;
}

export default function Profile({ user: initialUser }: ProfileProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pets');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const queryClient = useQueryClient();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);

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

  // Update selectedPet based on currentPetIndex
  const selectedPet = userPets.length > 0 ? userPets[currentPetIndex] : null;

  // State for AI task modules and progress
  const [taskModules, setTaskModules] = useState<TaskModule[]>([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStreak, setTaskStreak] = useState(0);
  const [aiTaskCount, setAiTaskCount] = useState(0);

  // Fetch AI recommendations for the selected pet
  const [recommendations, setRecommendations] = useState<any>(null);
  useEffect(() => {
    if (!selectedPet) return;
    setRecommendations(null);
    fetch(`/api/ai/recommendations/${selectedPet.id}`)
      .then(async (res) => {
        if (!res.ok) {
          // Try to generate if not found
          const genRes = await fetch('/api/ai/generate-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              petId: selectedPet.id,
              name: selectedPet.name,
              breed: selectedPet.breed,
              age: selectedPet.age,
              gender: selectedPet.gender,
              species: selectedPet.species || 'dog',
            })
          });
          if (!genRes.ok) return;
          const genData = await genRes.json();
          setRecommendations(genData.recommendations);
        } else {
          const data = await res.json();
          setRecommendations(data.recommendations);
        }
      });
  }, [selectedPet]);

  // Map recommendations to TaskModules
  useEffect(() => {
    if (!recommendations) {
      setTaskModules([]);
      setAiTaskCount(0);
      setTaskProgress(0);
      return;
    }
    const modules = generateTaskModulesFromPetCareData({ ...recommendations, name: selectedPet?.name });
    setTaskModules(modules);
    setAiTaskCount(modules.length);
    // Calculate progress
    const total = modules.reduce((acc, m) => acc + m.subtasks.length, 0);
    const done = modules.reduce((acc, m) => acc + m.completedSubtasks.filter(Boolean).length, 0);
    setTaskProgress(total > 0 ? Math.round((done / total) * 100) : 0);
  }, [recommendations, selectedPet]);

  // Task completion handlers
  const handleToggleSubtask = (moduleId: string, subtaskIdx: number) => {
    setTaskModules((prev) => prev.map((mod) =>
      mod.id === moduleId
        ? {
            ...mod,
            completedSubtasks: mod.completedSubtasks.map((c, i) => i === subtaskIdx ? !c : c)
          }
        : mod
    ));
  };
  const handleDeleteTask = (taskId: string) => {
    setTaskModules((prev) => prev.filter((mod) => mod.id !== taskId));
    setAiTaskCount((prev) => Math.max(0, prev - 1));
  };
  const handleAddTask = () => {
    // Placeholder: could open a modal to add a custom task
    alert('Add custom task (not implemented)');
  };

  // Swipe logic for pets
  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentPetIndex < userPets.length - 1) {
      setCurrentPetIndex(currentPetIndex + 1);
    } else if (direction === "right" && currentPetIndex > 0) {
      setCurrentPetIndex(currentPetIndex - 1);
    }
  };

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
        {userPets.map((pet: any, idx: number) => (
          <div
            key={pet.id}
            className={`flex flex-col items-center cursor-pointer ${currentPetIndex === idx ? 'ring-2 ring-pink-400' : ''}`}
            onClick={() => setCurrentPetIndex(idx)}
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
        <motion.div
          key={selectedPet.id}
          className="relative flex flex-col items-center justify-start w-full bg-white/80 dark:bg-zinc-900/70 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 mx-2 mt-2 overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(event, info) => {
            if (info.offset.x < -100) handleSwipe("left");
            else if (info.offset.x > 100) handleSwipe("right");
          }}
        >
          {/* Photo Area (75% of screen) */}
          <div className="w-full h-[75vh] flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-blue-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 z-0 backdrop-blur-sm bg-white/60 dark:bg-zinc-900/60" />
            <img
              src={selectedPet.profileImage || selectedPet.avatar || '/default-pet.png'}
              alt={selectedPet.name}
              className="object-cover w-full h-full relative z-10"
            />
            {/* Edit Pet Photo Button */}
            <button
              className="absolute top-3 right-3 bg-white/80 dark:bg-zinc-900/80 rounded-full p-2 shadow hover:bg-pink-100 dark:hover:bg-pink-900 transition z-20"
              onClick={() => setShowEditPetModal(true)}
              aria-label="Edit Pet Photo"
            >
              <Camera className="w-5 h-5 text-pink-500" />
            </button>
          </div>
          {/* Info Area Below Photo */}
          <div className="w-full flex flex-col items-center justify-center py-6">
            <div className="px-6 py-4 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60 shadow max-w-xs w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPet.name}</h2>
              <div className="flex items-center gap-4 mb-2">
                {selectedPet.age && (
                  <span className="flex items-center text-gray-700 dark:text-gray-200 text-lg font-medium">
                    <CalendarIcon className="w-5 h-5 mr-1" /> {selectedPet.age} yrs
                  </span>
                )}
                {selectedPet.gender && (
                  <span className="flex items-center text-gray-700 dark:text-gray-200 text-lg font-medium">
                    {/* TODO: Replace with proper gender icons if available */}
                    {selectedPet.gender.toLowerCase() === 'male' ? (
                      <User className="w-5 h-5 text-blue-500 mr-1" />
                    ) : selectedPet.gender.toLowerCase() === 'female' ? (
                      <UserIcon className="w-5 h-5 text-pink-500 mr-1" />
                    ) : null}
                    {selectedPet.gender}
                  </span>
                )}
              </div>
              {selectedPet.bio && (
                <p className="text-center text-gray-600 dark:text-gray-300 max-w-md">{selectedPet.bio}</p>
              )}
            </div>
          </div>
          {/* AI Task Dashboard */}
          {taskModules.length > 0 && (
            <div className="w-full max-w-md mx-auto mb-8">
              <TaskDashboard
                modules={taskModules}
                streak={taskStreak}
                aiTaskCount={aiTaskCount}
                progress={taskProgress}
                onAddTask={handleAddTask}
                onToggleSubtask={handleToggleSubtask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </motion.div>
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
