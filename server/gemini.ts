import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PetCareRecommendations {
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

export async function generatePetCareRecommendations(
  name: string,
  breed: string,
  age: number,
  gender: string,
  species: string = "dog"
): Promise<PetCareRecommendations> {
  try {
    const prompt = `Generate comprehensive care recommendations for a ${age}-year-old ${gender} ${breed} ${species} named ${name}. 

Please provide detailed, practical advice in the following areas:

1. Training Plan:
   - Basic commands appropriate for this breed and age
   - Weekly training schedule
   - Breed-specific training tips

2. Breeding Advice (if applicable):
   - Optimal breeding age
   - Health screenings needed
   - Important considerations for this breed

3. Daily Care Guidelines:
   - Daily routine recommendations
   - Nutrition tips specific to breed and age
   - Exercise requirements
   - Health monitoring checklist

4. Medical Recommendations:
   - Vaccination schedule
   - Common health issues for this breed
   - Preventive care measures

Format the response as JSON with the exact structure:
{
  "trainingPlan": {
    "basicCommands": ["command1", "command2", ...],
    "weeklySchedule": ["schedule1", "schedule2", ...],
    "tips": ["tip1", "tip2", ...]
  },
  "breedingAdvice": {
    "optimalAge": "age range",
    "healthScreening": ["screening1", "screening2", ...],
    "considerations": ["consideration1", "consideration2", ...]
  },
  "careGuidelines": {
    "dailyRoutine": ["routine1", "routine2", ...],
    "nutritionTips": ["tip1", "tip2", ...],
    "exerciseRequirements": "exercise description",
    "healthMonitoring": ["monitor1", "monitor2", ...]
  },
  "medicalRecommendations": {
    "vaccinationSchedule": ["vaccine1", "vaccine2", ...],
    "commonHealthIssues": ["issue1", "issue2", ...],
    "preventiveCare": ["care1", "care2", ...]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            trainingPlan: {
              type: "object",
              properties: {
                basicCommands: { type: "array", items: { type: "string" } },
                weeklySchedule: { type: "array", items: { type: "string" } },
                tips: { type: "array", items: { type: "string" } }
              },
              required: ["basicCommands", "weeklySchedule", "tips"]
            },
            breedingAdvice: {
              type: "object", 
              properties: {
                optimalAge: { type: "string" },
                healthScreening: { type: "array", items: { type: "string" } },
                considerations: { type: "array", items: { type: "string" } }
              },
              required: ["optimalAge", "healthScreening", "considerations"]
            },
            careGuidelines: {
              type: "object",
              properties: {
                dailyRoutine: { type: "array", items: { type: "string" } },
                nutritionTips: { type: "array", items: { type: "string" } },
                exerciseRequirements: { type: "string" },
                healthMonitoring: { type: "array", items: { type: "string" } }
              },
              required: ["dailyRoutine", "nutritionTips", "exerciseRequirements", "healthMonitoring"]
            },
            medicalRecommendations: {
              type: "object",
              properties: {
                vaccinationSchedule: { type: "array", items: { type: "string" } },
                commonHealthIssues: { type: "array", items: { type: "string" } },
                preventiveCare: { type: "array", items: { type: "string" } }
              },
              required: ["vaccinationSchedule", "commonHealthIssues", "preventiveCare"]
            }
          },
          required: ["trainingPlan", "breedingAdvice", "careGuidelines", "medicalRecommendations"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const recommendations: PetCareRecommendations = JSON.parse(rawJson);
      return recommendations;
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Failed to generate pet care recommendations:", error);
    // Return fallback recommendations
    return {
      trainingPlan: {
        basicCommands: ["sit", "stay", "come", "down"],
        weeklySchedule: ["Daily 10-15 minute sessions", "Focus on one command per week"],
        tips: ["Use positive reinforcement", "Keep sessions short and fun"]
      },
      breedingAdvice: {
        optimalAge: "2-3 years old",
        healthScreening: ["Hip dysplasia", "Eye examination", "Genetic testing"],
        considerations: ["Breed-specific health issues", "Temperament evaluation"]
      },
      careGuidelines: {
        dailyRoutine: ["Morning walk", "Feeding schedule", "Evening playtime"],
        nutritionTips: ["High-quality protein", "Age-appropriate portions"],
        exerciseRequirements: "30-60 minutes daily",
        healthMonitoring: ["Weight checks", "Dental health", "Coat condition"]
      },
      medicalRecommendations: {
        vaccinationSchedule: ["Core vaccines at 6-8 weeks", "Booster shots", "Annual check-ups"],
        commonHealthIssues: ["Joint problems", "Dental issues", "Skin conditions"],
        preventiveCare: ["Regular vet visits", "Parasite prevention", "Dental care"]
      }
    };
  }
}