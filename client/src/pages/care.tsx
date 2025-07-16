import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PetProfileCard from "@/components/pet-profile-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import AICareTab from "@/components/ai-care-tab";
import { useToast } from "@/hooks/use-toast";
import TaskDashboard from '@/components/task-dashboard';
import { generateTaskModulesFromPetCareData, TaskModule } from '@/components/ai-care-tab';
import PetCardsCarousel from "@/components/pet-cards-carousel";

function getLocalTasks(petId: number): TaskModule[] {
  const all = JSON.parse(localStorage.getItem('pawmatch_tasks') || '{}');
  return all[petId] || [];
}
function setLocalTasks(petId: number, tasks: TaskModule[]) {
  const all = JSON.parse(localStorage.getItem('pawmatch_tasks') || '{}');
  all[petId] = tasks;
  localStorage.setItem('pawmatch_tasks', JSON.stringify(all));
}

// Extend TaskModule for custom tasks
interface CustomTaskModule extends TaskModule {
  isCustom: boolean;
}

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
  // Calculate progress and streak directly from taskModules
  const totalTasks = taskModules.reduce((acc, m) => acc + m.subtasks.length, 0);
  const doneTasks = taskModules.reduce((acc, m) => acc + m.completedSubtasks.filter(Boolean).length, 0);
  const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  // Streak: get from localStorage for selected pet
  let taskStreak = 0;
  if (selectedPet) {
    const streakData = JSON.parse(localStorage.getItem('pawmatch_streaks') || '{}');
    taskStreak = streakData[selectedPet.id]?.streak || 0;
  }
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
      return;
    }
    const modules = generateTaskModulesFromPetCareData({ ...recommendations, name: selectedPet?.name });
    setTaskModules(modules);
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState("");

  // Load custom tasks from localStorage
  useEffect(() => {
    if (!selectedPet) return;
    const localTasks = getLocalTasks(selectedPet.id);
    setTaskModules((prev) => [
      ...prev.filter(m => !(m as CustomTaskModule).isCustom),
      ...localTasks.map((t: TaskModule) => ({
        ...t,
        isCustom: true
      }))
    ]);
  }, [selectedPet]);

  // Save custom tasks to localStorage on change
  useEffect(() => {
    if (!selectedPet) return;
    const custom = taskModules.filter((m: TaskModule | CustomTaskModule) => (m as CustomTaskModule).isCustom);
    setLocalTasks(selectedPet.id, custom as TaskModule[]);
  }, [taskModules, selectedPet]);

  // Add Task handler
  const handleAddTask = () => setShowAddModal(true);
  const handleSaveTask = () => {
    if (!newTask.trim()) return;
    setTaskModules((prev) => [
      ...prev,
      {
        id: 'custom-' + Date.now(),
        category: 'Care', // Use a valid TaskModule category
        title: newTask,
        description: '',
        priority: 'medium',
        aiConfidence: 0,
        estimatedTime: '',
        frequency: 'once',
        subtasks: [newTask],
        completedSubtasks: [false],
        isCustom: true
      } as CustomTaskModule
    ]);
    setNewTask("");
    setShowAddModal(false);
  };

  // Sort taskModules: custom tasks first
  const sortedTaskModules = [
    ...taskModules.filter((m: any) => (m as any).isCustom),
    ...taskModules.filter((m: any) => !(m as any).isCustom)
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-900">Care</h1>
      </header>
      {/* Pet Selection Row */}
      <div className="px-0 pt-2 pb-4">
        <PetCardsCarousel
          pets={userPets}
          selectedPetId={selectedPet?.id}
          onSelectPet={setSelectedPetId}
        />
      </div>
      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl flex flex-col gap-4">
            <h2 className="text-lg font-bold">Add Task</h2>
            <input
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Task name..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white" onClick={handleSaveTask}>Add</button>
            </div>
          </div>
        </div>
      )}
      {/* AI Task Dashboard for Selected Pet */}
      <div className="px-4 mt-4">
        {selectedPet && sortedTaskModules.length > 0 && (
          <TaskDashboard
            modules={sortedTaskModules}
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