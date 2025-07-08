import { useState } from "react";
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
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

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/ai/chat', 'POST', {
        message,
        petName: pet.name,
        petBreed: pet.breed,
        petAge: pet.age,
        petSpecies: pet.species
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.response || '',
        timestamp: new Date()
      }]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="chat">Chat with AI</TabsTrigger>
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
        
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Pet Care Assistant
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ask me anything about {pet.name}'s care, health, or behavior!
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-md p-4 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Start a conversation with your AI pet care assistant!</p>
                    <p className="text-sm mt-2">Ask about training, health, nutrition, or behavior.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white ml-12' 
                            : 'bg-gray-100 text-gray-900 mr-12'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                          <Bot className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 p-3 rounded-lg bg-gray-100 text-gray-900 mr-12">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask about ${pet.name}'s care...`}
                  disabled={chatMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}