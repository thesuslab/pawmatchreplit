import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import AICareTab from "@/components/ai-care-tab";
import { useToast } from "@/hooks/use-toast";
import TaskDashboard from '@/components/task-dashboard';
import { generateTaskModulesFromPetCareData, TaskModule } from '@/components/ai-care-tab';
import { useEffect } from 'react';

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

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const selectedPet = userPets.find((pet: any) => pet.id === selectedPetId) || userPets[0];

  // AI Task Dashboard logic (no aiTaskCount, no aiConfidence)
  const [taskModules, setTaskModules] = useState<TaskModule[]>([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStreak, setTaskStreak] = useState(0); // Placeholder, wire up real streak logic later
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
  useEffect(() => {
    if (!recommendations) {
      setTaskModules([]);
      setTaskProgress(0);
      return;
    }
    const modules = generateTaskModulesFromPetCareData({ ...recommendations, name: selectedPet?.name });
    setTaskModules(modules);
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
  };
  const handleAddTask = () => {
    alert('Add custom task (not implemented)');
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900">Care</h1>
      </header>

      {/* Pet Selection Row */}
      <div className="px-4 py-3">
        <Carousel opts={{ align: "center", loop: false }}>
          <CarouselContent>
            {userPets.map((pet: any) => (
              <CarouselItem key={pet.id} className="px-2">
                <div
                  className={`max-w-[320px] mx-auto ${selectedPet?.id === pet.id ? 'ring-2 ring-pink-400 scale-105' : ''}`}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <PetProfileCard pet={pet} currentUser={user} expandable={false} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* AI Care Tab for Selected Pet */}

      {/* AI Task Dashboard for Selected Pet */}
      <div className="px-4 mt-4">
        {selectedPet && taskModules.length > 0 && (
          <TaskDashboard
            modules={taskModules}
            streak={taskStreak}
            progress={taskProgress}
            onAddTask={handleAddTask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteTask={handleDeleteTask}
            compact={false}
          />
        )}
      </div>

      <BottomNavigation currentPage="care" />
    </div>
  );
} 