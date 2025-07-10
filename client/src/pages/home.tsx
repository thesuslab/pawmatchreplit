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
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { generateTaskModulesFromPetCareData, TaskModule } from '@/components/ai-care-tab';

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
  const [showAllTasks, setShowAllTasks] = useState(false);

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

  // Notification header with bell icon and app label
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

  // Fetch follows for the user
  const { data: follows = [] } = useQuery({
    queryKey: ['/api/follows/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/follows/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch follows');
      return response.json();
    }
  });
  // Get set of followed pet IDs
  const followedPetIds = new Set(follows.map((f: any) => f.followedPetId));
  // Filter posts to only those from followed pets
  const followedPosts = posts.filter((post: any) => post.pet && followedPetIds.has(post.pet.id));

  // State for selected pet
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const selectedPet = userPets.find((pet: any) => pet.id === selectedPetId) || userPets[0];

  // --- Layout ---
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Notification dropdown/modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-4 top-16 bg-white border rounded-lg shadow-lg w-72 z-50 max-h-96 overflow-y-auto backdrop-blur-sm bg-white/60 dark:bg-zinc-900/60"
          >
            <div className="p-2 font-semibold border-b text-gray-900 dark:text-white">Notifications</div>
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 dark:text-gray-400">No notifications</div>
            ) : (
              notifications.map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 border-b last:border-b-0 text-sm text-gray-900 dark:text-gray-100"
                >
                  <div className="font-medium">{n.type.replace(/_/g, ' ')}</div>
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">PawConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative" onClick={handleBellClick} aria-label="Notifications">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : followedPosts.length > 0 ? (
          followedPosts.map((post: any) => (
            <PetPost key={post.id} post={post} currentUser={user} />
          ))
        ) : (
          <div className="text-center py-8 px-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Follow some pets or create your first post to get started.</p>
          </div>
        )}
      </div>

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

      <AnimatePresence>
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
      </AnimatePresence>

      {/* View All Tasks Modal */}
      <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
        <DialogContent className="backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80">
          <DialogHeader>
            <DialogTitle>All Tasks for {selectedPet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Today's Tasks */}
            <div>
              <div className="font-semibold text-base mb-2">Today's Tasks</div>
              {/* taskModules.length === 0 ? (
                <div className="text-xs text-gray-500">No tasks for today! 🎉</div>
              ) : (
                <div className="space-y-2">
                  {taskModules.map((mod) => (
                    mod.subtasks.map((sub, idx) => (
                      !mod.completedSubtasks[idx] && (
                        <div key={mod.id + '-' + idx} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize text-xs px-2 py-1 mr-1">{mod.category}</Badge>
                            <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{sub}</span>
                          </div>
                          <button
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all border-gray-300 bg-white hover:border-gray-400`}
                            onClick={() => handleToggleSubtask(mod.id, idx)}
                            title={'Mark as done'}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      )
                    ))
                  ))}
                </div>
              ) : ( */}
                <div className="text-xs text-gray-500">No tasks for today! 🎉</div>
              {/* )} */}
            </div>
            {/* Completed Tasks */}
            <div>
              <div className="font-semibold text-base mb-2 mt-4">Completed</div>
              {/* taskModules.every(mod => mod.completedSubtasks.every(Boolean)) ? (
                <div className="text-xs text-gray-500">No completed tasks yet.</div>
              ) : (
                <div className="space-y-2">
                  {taskModules.map((mod) => (
                    mod.subtasks.map((sub, idx) => (
                      mod.completedSubtasks[idx] && (
                        <div key={mod.id + '-done-' + idx} className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 opacity-80">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize text-xs px-2 py-1 mr-1">{mod.category}</Badge>
                            <span className="font-bold text-gray-500 text-sm line-through truncate max-w-[120px]">{sub}</span>
                          </div>
                          <button
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all border-green-400 bg-white hover:border-green-600`}
                            onClick={() => handleToggleSubtask(mod.id, idx)}
                            title={'Mark as incomplete'}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      )
                    ))
                  ))}
                </div>
              ) : ( */}
                <div className="text-xs text-gray-500">No completed tasks yet.</div>
              {/* )} */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
