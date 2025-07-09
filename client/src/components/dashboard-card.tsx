import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, Flame, Star } from 'lucide-react';

interface DashboardState {
  totalPets: number;
  completedTasks: number;
  streak: number;
  xp: number;
  achievements: string[];
  aiRecommendations?: string[];
}

export default function DashboardCard({ state }: { state: DashboardState }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" /> Dashboard
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary"><Flame className="w-4 h-4 mr-1 inline" />Streak: {state.streak}</Badge>
            <Badge variant="secondary"><Star className="w-4 h-4 mr-1 inline" />XP: {state.xp}</Badge>
          </div>
        </div>
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{state.totalPets}</div>
            <div className="text-xs text-gray-500">Pets</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{state.completedTasks}</div>
            <div className="text-xs text-gray-500">Tasks Done</div>
          </div>
        </div>
        {state.achievements && state.achievements.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-sm mb-1 flex items-center gap-1"><Trophy className="w-4 h-4 text-yellow-500" />Achievements</div>
            <div className="flex flex-wrap gap-2">
              {state.achievements.map((ach, i) => (
                <Badge key={i} variant="outline">{ach}</Badge>
              ))}
            </div>
          </div>
        )}
        {state.aiRecommendations && state.aiRecommendations.length > 0 && (
          <div>
            <div className="font-semibold text-sm mb-1 flex items-center gap-1"><Sparkles className="w-4 h-4 text-blue-500" />AI Recommendations</div>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {state.aiRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 