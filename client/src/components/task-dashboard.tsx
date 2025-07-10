import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Flame, Plus, Check, Clock, Calendar, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

interface TaskModule {
  id: string;
  category: string;
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
  aiTaskCount?: number;
  progress: number;
  onAddTask: () => void;
  onToggleSubtask: (moduleId: string, subtaskIdx: number) => void;
  onDeleteTask: (taskId: string) => void;
  compact?: boolean;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function TaskDashboard({
  modules,
  streak,
  aiTaskCount,
  progress,
  onAddTask,
  onToggleSubtask,
  onDeleteTask
}: TaskDashboardProps) {

  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <Card className="mb-4 bg-white/90 border border-purple-100 shadow-sm">
      <CardContent className="p-4">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <CircularProgress percent={progress} />
            <StatItem value={progress + '%'} label="Completed" color="text-blue-600" />
            <StatItem value={streak} label="Day Streak" color="text-orange-600" />
            <StatItem value={aiTaskCount ?? 0} label="AI Tasks" color="text-purple-600" />
          </div>
          <button
            className="flex items-center gap-1 text-purple-600 text-xs px-3 py-2 bg-purple-50 rounded-lg hover:bg-purple-100 font-semibold transition-colors"
            onClick={onAddTask}
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Tasks */}
        <div>
          <div className="font-semibold text-base mb-2">Today's Tasks</div>
          {modules.length === 0 ? (
            <div className="text-xs text-gray-500">No tasks for today! 🎉</div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                const isExpanded = expandedTaskIds.has(mod.id);
                return (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(mod.id)}>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={isExpanded ? "Collapse task" : "Expand task"}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(mod.id); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(mod.id); } }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <Badge variant="secondary" className="capitalize text-xs px-2 py-0.5">{mod.category}</Badge>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(mod.priority)}`}>{mod.priority}</span>
                      </div>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete Task"
                        onClick={(e) => { e.stopPropagation(); onDeleteTask(mod.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-1">
                      <div className="font-medium text-gray-800 text-sm">{mod.title}</div>
                      <div className="text-xs text-gray-600">{mod.description}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span><Clock className="inline w-4 h-4 mr-0.5" /> {mod.estimatedTime}</span>
                        <span><Calendar className="inline w-4 h-4 mr-0.5" /> {mod.frequency}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 space-y-1 transition-all ease-in-out">
                        {mod.subtasks.map((sub, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${mod.completedSubtasks[idx] ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200 hover:border-gray-300'}`}
                            onClick={() => onToggleSubtask(mod.id, idx)}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mod.completedSubtasks[idx] ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                              {mod.completedSubtasks[idx] && <Check size={12} />}
                            </div>
                            <span className={`text-sm ${mod.completedSubtasks[idx] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {sub}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ value, label, color }: { value: string | number, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 18;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} className="mr-2">
      <circle
        stroke="#a78bfa"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ opacity: 0.2 }}
      />
      <circle
        stroke="#a78bfa"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease', filter: 'drop-shadow(0 0 3px #a78bfa)' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="0.75rem"
        fill="#6d28d9"
        fontWeight="bold"
      >
        {percent}%
      </text>
    </svg>
  );
}
