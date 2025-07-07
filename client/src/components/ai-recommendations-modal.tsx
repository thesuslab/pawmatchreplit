import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Dumbbell, Heart, Stethoscope, X } from "lucide-react";

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

interface AIRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  recommendations: PetCareRecommendations;
}

export default function AIRecommendationsModal({ 
  isOpen, 
  onClose, 
  petName, 
  recommendations 
}: AIRecommendationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <DialogTitle>AI Care Recommendations for {petName}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training" className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="care" className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Daily Care
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              Medical
            </TabsTrigger>
            <TabsTrigger value="breeding" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Breeding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Commands</CardTitle>
                  <CardDescription>Essential commands for {petName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.trainingPlan.basicCommands.map((command, index) => (
                      <Badge key={index} variant="secondary">{command}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.trainingPlan.weeklySchedule.map((schedule, index) => (
                      <li key={index} className="text-sm">{schedule}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.trainingPlan.tips.map((tip, index) => (
                      <li key={index} className="text-sm">{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="care" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Routine</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.careGuidelines.dailyRoutine.map((routine, index) => (
                      <li key={index} className="text-sm">{routine}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exercise Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{recommendations.careGuidelines.exerciseRequirements}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nutrition Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.careGuidelines.nutritionTips.map((tip, index) => (
                      <li key={index} className="text-sm">{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.careGuidelines.healthMonitoring.map((monitor, index) => (
                      <li key={index} className="text-sm">{monitor}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vaccination Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.medicalRecommendations.vaccinationSchedule.map((vaccine, index) => (
                      <li key={index} className="text-sm">{vaccine}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Health Issues</CardTitle>
                  <CardDescription>Watch out for these breed-specific concerns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.medicalRecommendations.commonHealthIssues.map((issue, index) => (
                      <Badge key={index} variant="outline">{issue}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preventive Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.medicalRecommendations.preventiveCare.map((care, index) => (
                      <li key={index} className="text-sm">{care}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breeding" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimal Breeding Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{recommendations.breedingAdvice.optimalAge}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Screening</CardTitle>
                  <CardDescription>Required tests before breeding</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.breedingAdvice.healthScreening.map((screening, index) => (
                      <li key={index} className="text-sm">{screening}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Important Considerations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendations.breedingAdvice.considerations.map((consideration, index) => (
                      <li key={index} className="text-sm">{consideration}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}