import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import StoriesHighlights from "@/components/stories-highlights";
import PetPost from "@/components/pet-post";
import AddPetModal from "@/components/add-pet-modal";
import CreatePostModal from "@/components/create-post-modal";
import { Heart, MessageCircle, Send, Plus, Bell } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Plus as PlusIcon } from 'lucide-react';
import DashboardCard from '@/components/dashboard-card';
import TaskDashboard from '@/components/task-dashboard';
import DashboardHeader from '@/components/dashboard-header';
import PetCardsCarousel from '@/components/pet-cards-carousel';

// Define Notification type
interface Notification {
  type: string;
  message: string;
  read: boolean;
  timestamp: number;
}

interface HomeProps {
  user: any;
}

export default function Home({ user }: HomeProps) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect to WebSocket for notifications
    if (!user?.id) return;
    const ws = new WebSocket(`ws://localhost:5000?userId=${user.id}`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type !== 'connected') {
          setNotifications((prev) => [{ ...data, read: false, timestamp: Date.now() }, ...prev]);
        }
      } catch {}
    };
    return () => ws.close();
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleChatClick = () => {
    // Placeholder for chat UI
    alert('Chat feature coming soon!');
  };

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

  const { data: dashboardState } = useQuery({
    queryKey: ['/api/dashboard', user.id],
    queryFn: async () => {
      // Replace with your actual dashboard API endpoint
      const response = await fetch(`/api/dashboard/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
    // For now, provide mock data if API is not available
    initialData: {
      totalPets: userPets.length,
      completedTasks: userPets.reduce((sum: number, pet: any) => sum + (pet.completedTasks || 0), 0),
      streak: 3,
      xp: 120,
      achievements: ['First Walk', 'Healthy Diet'],
      aiRecommendations: [
        'Take Bella for a walk today',
        'Schedule a vet checkup for Max',
        'Try a new healthy treat for Luna'
      ]
    }
  });

  // Auto-create tasks from AI recommendations for each pet (only once per pet)
  useEffect(() => {
    if (!userPets || userPets.length === 0) return;
    userPets.forEach(async (pet: any) => {
      const aiFlagKey = `aiTasksCreatedForPet_${pet.id}`;
      if (localStorage.getItem(aiFlagKey)) return; // Already created
      // Fetch AI recommendations for this pet
      const res = await fetch(`/api/ai/recommendations/${pet.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const recs = data?.recommendations;
      if (!recs) return;
      // Flatten actionable items
      const actionable = [
        ...(recs.trainingPlan?.basicCommands || []),
        ...(recs.trainingPlan?.weeklySchedule || []),
        ...(recs.trainingPlan?.tips || []),
        ...(recs.careGuidelines?.dailyRoutine || []),
        ...(recs.careGuidelines?.nutritionTips || []),
        ...(recs.careGuidelines?.healthMonitoring || []),
        ...(recs.medicalRecommendations?.vaccinationSchedule || []),
        ...(recs.medicalRecommendations?.preventiveCare || []),
      ];
      // Fetch existing tasks for this pet
      const tasksRes = await fetch(`/api/pets/${pet.id}/tasks`);
      if (!tasksRes.ok) return;
      const existingTasks = await tasksRes.json();
      const existingTitles = new Set(existingTasks.map((t: any) => t.title));
      // Create missing tasks
      let created = false;
      for (const title of actionable) {
        if (!existingTitles.has(title)) {
          await fetch(`/api/pets/${pet.id}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, isAiGenerated: true }),
          });
          created = true;
        }
      }
      if (created) {
        queryClient.invalidateQueries({ queryKey: ['/api/pets', user.id, 'all-tasks'] });
      }
      localStorage.setItem(aiFlagKey, 'true'); // Mark as created
    });
  }, [userPets, user.id, queryClient]);

  // Fetch all tasks for all pets
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/pets', user.id, 'all-tasks'],
    queryFn: async () => {
      const petsRes = await fetch(`/api/pets/user/${user.id}`);
      if (!petsRes.ok) throw new Error('Failed to fetch pets');
      const pets = await petsRes.json();
      // Fetch tasks for each pet
      const all = await Promise.all(
        pets.map(async (pet: any) => {
          const res = await fetch(`/api/pets/${pet.id}/tasks`);
          if (!res.ok) return [];
          const tasks = await res.json();
          return tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            petName: pet.name,
            petAvatar: pet.profileImage || pet.avatar,
            isAiGenerated: task.isAiGenerated,
            dueDate: task.dueDate,
          }));
        })
      );
      return all.flat();
    }
  });

  // Handle task toggle
  const taskToggleMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: number, newStatus: string }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets', user.id, 'all-tasks'] });
    }
  });

  // State for selected pet
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const selectedPet = userPets.find((pet: any) => pet.id === selectedPetId) || userPets[0];

  // Compute streak, xp, and progress for header (mock for now)
  const streak = dashboardState.streak || 0;
  const xp = dashboardState.xp || 0;
  // Progress: percent of today's tasks completed for selected pet
  const todayTasks = allTasks.filter((t: any) => t.petName === selectedPet?.name && t.status !== 'complete');
  const completedToday = allTasks.filter((t: any) => t.petName === selectedPet?.name && t.status === 'complete').length;
  const totalToday = todayTasks.length + completedToday;
  const progress = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  // Filter tasks for selected pet
  const petTasks = allTasks.filter((t: any) => t.petName === selectedPet?.name);

  // Group petTasks into modules for TaskDashboard
  // For now, use mock grouping logic based on keywords (in real app, use AI rec structure or task metadata)
  const categoryMap = {
    training: ['sit', 'stay', 'come', 'leash', 'recall', 'heel', 'command', 'training'],
    health: ['exercise', 'walk', 'vet', 'vaccination', 'health', 'monitor', 'checkup'],
    care: ['groom', 'brush', 'clean', 'nail', 'teeth', 'ear', 'routine', 'care'],
  };
  function getCategory(title: string) {
    const lower = title.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return 'other';
  }
  // Group tasks by category and module title
  const modulesMap: Record<string, any> = {};
  petTasks.forEach((task: any) => {
    const category = getCategory(task.title);
    // Use the first word(s) as module title (improve as needed)
    const modKey = category + ':' + (task.title.split(' ')[0] || task.title);
    if (!modulesMap[modKey]) {
      modulesMap[modKey] = {
        id: modKey,
        category,
        title: task.title,
        description: '',
        priority: 'medium',
        aiConfidence: task.isAiGenerated ? 0.9 : 0.7,
        estimatedTime: '15 min',
        frequency: 'daily',
        subtasks: [],
        completedSubtasks: [],
      };
    }
    modulesMap[modKey].subtasks.push(task.title);
    modulesMap[modKey].completedSubtasks.push(task.status === 'complete');
  });
  const modules = Object.values(modulesMap);
  const aiTaskCount = petTasks.filter((t: any) => t.isAiGenerated).length;

  // Subtask toggle handler
  const handleToggleSubtask = (moduleId: string, subtaskIdx: number) => {
    const mod = modules.find((m: any) => m.id === moduleId);
    if (!mod) return;
    const subtaskTitle = mod.subtasks[subtaskIdx];
    const task = petTasks.find((t: any) => t.title === subtaskTitle);
    if (!task) return;
    const newStatus = task.status === 'complete' ? 'pending' : 'complete';
    taskToggleMutation.mutate({ taskId: task.id, newStatus });
  };

  // Quick action handlers (placeholders for now)
  const handleAddTask = () => alert('Add Task coming soon!');
  const handleAddPost = () => setShowCreatePostModal(true);
  const handleShareMilestone = () => alert('Share Milestone coming soon!');
  const handleViewAchievements = () => alert('Achievements modal coming soon!');

  // Demo breed-based visuals
  const breedVisuals: Record<string, { emoji: string; color: string; demoImg: string }> = {
    'golden retriever': { emoji: '🐕', color: 'from-orange-400 to-yellow-500', demoImg: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=facearea&w=256&h=256&facepad=2' },
    'british shorthair': { emoji: '🐱', color: 'from-purple-400 to-pink-500', demoImg: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2' },
    'german shepherd': { emoji: '🐕‍🦺', color: 'from-blue-400 to-cyan-500', demoImg: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=facearea&w=256&h=256&facepad=2' },
    // Add more breeds as needed
  };
  function getBreedVisuals(breed: string) {
    const key = breed?.toLowerCase() || '';
    return breedVisuals[key] || { emoji: '🐾', color: 'from-pink-200 to-blue-200', demoImg: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=facearea&w=256&h=256&facepad=2' };
  }

  // Fallback: If no AI tasks exist for a pet, add a demo AI task module
  if (modules.length === 0) {
    const visuals = getBreedVisuals(selectedPet?.breed);
    modules.push({
      id: 'demo-training',
      category: 'training',
      title: 'Basic Commands',
      description: 'Practice sit, stay, come commands',
      priority: 'high',
      aiConfidence: 0.95,
      estimatedTime: '15 min',
      frequency: 'daily',
      subtasks: [
        "Practice 'sit' command 5 times",
        "Work on 'stay' with treats",
        "Practice recall in yard",
        "Reward successful commands"
      ],
      completedSubtasks: [false, false, false, false],
    });
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Notification dropdown/modal */}
      {showNotifications && (
        <div className="absolute right-4 top-16 bg-white border rounded-lg shadow-lg w-72 z-50 max-h-96 overflow-y-auto">
          <div className="p-2 font-semibold border-b">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-3 border-b last:border-b-0 text-sm">
                <div className="font-medium">{n.type.replace(/_/g, ' ')}</div>
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h1 className="text-xl font-bold text-gray-900">PawConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative" onClick={handleBellClick} aria-label="Notifications">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
          <button onClick={handleChatClick} aria-label="Chat">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </header>
      {/* Stories Highlights */}
      <StoriesHighlights pets={userPets} />

      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={async () => queryClient.invalidateQueries({ queryKey: ['/api/posts/feed', user.id] })}>
        <>
          <div className="px-4 pt-4">
            {/* New Dashboard Header */}
            <DashboardHeader
              user={user}
              streak={streak}
              xp={xp}
              progress={progress}
              onAddTask={handleAddTask}
              onAddPost={handleAddPost}
              onShareMilestone={handleShareMilestone}
              onViewAchievements={handleViewAchievements}
            />
            {/* Pet Cards Carousel */}
            <PetCardsCarousel
              pets={userPets.map((pet: any) => {
                const visuals = getBreedVisuals(pet.breed);
                return {
                  id: pet.id,
                  name: pet.name,
                  breed: pet.breed,
                  age: pet.age + ' years',
                  avatar: pet.profileImage || pet.avatar || visuals.demoImg,
                  emoji: visuals.emoji,
                  color: visuals.color,
                  progress: progress, // For now, use same progress for all
                  streakDays: streak, // For now, use same streak for all
                  nextTask: petTasks.find(t => t.status !== 'complete')?.title || '—',
                };
              })}
              selectedPetId={selectedPet?.id}
              onSelectPet={setSelectedPetId}
            />
            {/* Main Task Panel for Selected Pet */}
            <TaskDashboard
              modules={modules}
              streak={streak}
              aiTaskCount={aiTaskCount}
              progress={progress}
              onAddTask={handleAddTask}
              onToggleSubtask={handleToggleSubtask}
            />
          </div>
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
        </>
      </PullToRefresh>

      {/* Floating Add Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3 z-40">
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          title="Create Post"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowAddPetModal(true)}
          className="w-14 h-14 bg-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          title="Add Pet"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </button>
      </div>

      <BottomNavigation currentPage="home" />

      {showAddPetModal && (
        <AddPetModal
          isOpen={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          userId={user.id}
        />
      )}

      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          userId={user.id}
        />
      )}
    </div>
  );
}

function PetCard({ pet, userId }: { pet: any, userId: number }) {
  // Only show pet info, no tasks
  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div className="flex w-full items-stretch">
          {/* Left: Pet photo and name */}
          <div className="flex flex-col items-center justify-center w-full p-2">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2">
              {pet.profileImage || pet.avatar ? (
                <img src={pet.profileImage || pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-200 to-blue-200">
                  <Heart className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
            <div className="font-semibold text-center text-sm">{pet.name}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
