import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Flame, Star, Plus, Trophy, Share2, Edit3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardHeaderProps {
  user: any;
  streak: number;
  xp: number;
  progress: number; // 0-100
  onAddTask: () => void;
  onAddPost: () => void;
  onShareMilestone: () => void;
  onViewAchievements: () => void;
}

export default function DashboardHeader({ user, streak, xp, progress, onAddTask, onAddPost, onShareMilestone, onViewAchievements }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return (
    <div className="bg-gradient-to-br from-pink-100 to-blue-100 rounded-2xl p-5 mb-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Avatar>
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} />
          ) : (
            <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900">{getGreeting()}, {user.name?.split(' ')[0] || 'Friend'}!</div>
          <div className="text-sm text-gray-600">You and your pets are on a roll! 🐾</div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <span className="font-semibold text-orange-700">{streak} day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 animate-spin" />
          <span className="font-semibold text-yellow-700">{xp} XP</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onViewAchievements} aria-label="View Achievements">
          <Trophy className="w-5 h-5 text-pink-500" />
        </Button>
      </div>
      <div className="mt-2">
        <Progress value={progress} className="h-3 bg-white/60" />
        <div className="text-xs text-gray-500 mt-1">Today's Progress: {progress}%</div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="default" onClick={onAddTask}><Plus className="w-4 h-4" /> Add Task</Button>
        <Button variant="secondary" onClick={onAddPost}><Edit3 className="w-4 h-4" /> Add Post</Button>
        <Button variant="outline" onClick={onShareMilestone}><Share2 className="w-4 h-4" /> Share Milestone</Button>
      </div>
    </div>
  );
} 