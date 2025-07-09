import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Flame, Plus, Check, Clock, Calendar } from 'lucide-react';

interface TaskModule {
  id: string;
  category: string; // training, health, care, etc.
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  aiConfidence: number;
  estimatedTime: string;
  frequency: string;
  subtasks: string[];
  completedSubtasks: boolean[];
}

interface TaskDashboardProps {
  modules: TaskModule[];
  streak: number;
  aiTaskCount: number;
  progress: number; // 0-100
  onAddTask: () => void;
  onToggleSubtask: (moduleId: string, subtaskIdx: number) => void;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function TaskDashboard({ modules, streak, aiTaskCount, progress, onAddTask, onToggleSubtask }: TaskDashboardProps) {
  return (
    <Card className="mb-4 bg-white/90 border-2 border-pink-100 shadow-md">
      <CardContent className="p-4">
        {/* Compact Stats Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <CircularProgress percent={progress} />
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-blue-600">{progress}%</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-orange-600">{streak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-purple-600">{aiTaskCount}</div>
              <div className="text-xs text-gray-500">AI Tasks</div>
            </div>
          </div>
          <button
            className="flex items-center gap-1 text-pink-600 text-xs px-3 py-2 bg-pink-50 rounded-lg hover:bg-pink-100 font-semibold"
            onClick={onAddTask}
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
        {/* Today's Tasks */}
        <div>
          <div className="font-semibold text-base mb-2">Today's Tasks</div>
          {modules.length === 0 ? (
            <div className="text-xs text-gray-500">No tasks for today! 🎉</div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize text-xs px-2 py-1 mr-2">{mod.category}</Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(mod.priority)}`}>{mod.priority}</span>
                      <span className="text-xs text-blue-500 ml-2">AI: {Math.round(mod.aiConfidence * 100)}%</span>
                    </div>
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{mod.title}</div>
                  <div className="text-xs text-gray-600 mb-2">{mod.description}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <span><Clock className="inline w-4 h-4 mr-1" />{mod.estimatedTime}</span>
                    <span><Calendar className="inline w-4 h-4 mr-1" />{mod.frequency}</span>
                  </div>
                  <div className="space-y-1">
                    {mod.subtasks.map((sub, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${mod.completedSubtasks[idx] ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200 hover:border-gray-300'}`}
                        onClick={() => onToggleSubtask(mod.id, idx)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mod.completedSubtasks[idx] ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                          {mod.completedSubtasks[idx] && <Check size={12} />}
                        </div>
                        <span className={`text-sm ${mod.completedSubtasks[idx] ? 'line-through text-gray-500' : 'text-gray-700'}`}>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  // SVG circle progress
  const radius = 18;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} className="mr-2">
      <circle
        stroke="#f472b6"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ opacity: 0.2 }}
      />
      <circle
        stroke="#f472b6"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s', filter: 'drop-shadow(0 0 4px #f472b6)' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="1rem"
        fill="#db2777"
        fontWeight="bold"
      >
        {percent}%
      </text>
    </svg>
  );
} 