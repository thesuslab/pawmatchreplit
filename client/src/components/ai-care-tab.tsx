import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Heart, Brain, Stethoscope, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AICareTabProps {
  pet: any;
  userId: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PetCareRecommendations {
  trainingPlan: {
    basicCommands: string[];
    weeklySchedule: string[];
    tips: string[];
  };
  breedingAdvice: {
    optimalAge: string;
    healthScreening: string[];
    considerations: string[];
  };
  careGuidelines: {
    dailyRoutine: string[];
    nutritionTips: string[];
    exerciseRequirements: string;
    healthMonitoring: string[];
  };
  medicalRecommendations: {
    vaccinationSchedule: string[];
    commonHealthIssues: string[];
    preventiveCare: string[];
  };
}

export default function AICareTab({ pet, userId }: AICareTabProps) {
  // Remove chatMessages, inputMessage, chatMutation, handleSendMessage, handleKeyPress, and Chat tab UI
  // Only show the AI Recommendations tab and its content
  const { toast } = useToast();

  // Fetch AI recommendations for the pet
  const { data, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/ai/recommendations', pet.id],
    queryFn: async () => {
      const response = await fetch(`/api/ai/recommendations/${pet.id}`);
      if (!response.ok) {
        // If no recommendations exist, try to generate them
        const generateResponse = await fetch('/api/ai/generate-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId: pet.id,
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            gender: pet.gender,
            species: pet.species || 'dog'
          })
        });
        if (!generateResponse.ok) throw new Error('Failed to generate AI recommendations');
        return generateResponse.json();
      }
      return response.json();
    }
  });
  const recommendations = data?.recommendations;

  if (recommendationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AI recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations ? (
            <div className="grid gap-4">
              {/* Training Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Training Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Basic Commands</h4>
                    {recommendations.trainingPlan?.basicCommands?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {recommendations.trainingPlan.basicCommands.map((command: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {command}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No commands available</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Weekly Schedule</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.trainingPlan?.weeklySchedule?.map((schedule: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {schedule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Training Tips</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.trainingPlan?.tips?.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Care Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Daily Care Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Daily Routine</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.careGuidelines?.dailyRoutine?.map((routine: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          {routine}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Exercise Requirements</h4>
                    <p className="text-sm text-gray-600">{recommendations.careGuidelines?.exerciseRequirements || ''}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Nutrition Tips</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.careGuidelines?.nutritionTips?.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Health Monitoring</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.careGuidelines?.healthMonitoring?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    Medical Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Vaccination Schedule</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.medicalRecommendations?.vaccinationSchedule?.map((vaccine: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {vaccine}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Common Health Issues</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.medicalRecommendations?.commonHealthIssues?.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Preventive Care</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.medicalRecommendations?.preventiveCare?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Breeding Advice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Breeding Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Optimal Age</h4>
                    <p className="text-sm text-gray-600">{recommendations.breedingAdvice?.optimalAge || ''}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Health Screening</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.breedingAdvice?.healthScreening?.map((screening: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          {screening}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Important Considerations</h4>
                    <ul className="text-sm space-y-1">
                      {recommendations.breedingAdvice?.considerations?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No AI recommendations available for this pet yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Recommendations are generated when you create a new pet profile.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}