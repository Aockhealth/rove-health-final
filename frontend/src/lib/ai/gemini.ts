
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

// Helper for Anonymized Prompt Construction
export function constructDailyPlanPrompt(context: {
    phase: string;
    dayOfCycle: number;
    goal: string;
    metabolicConditions: string[];
    dietaryPreferences: string[];
    activityLevel: string;
}) {
    // Determine strictness based on goal
    let goalInstruction = "";
    if (context.goal === "weight_loss") goalInstruction = "Focus on caloric deficit but high satiety. Recommend fat-burning foods.";
    if (context.goal === "muscle_gain") goalInstruction = "Maximize protein intake and recommend hypertrophy-focused movements.";

    return `
      You are an expert women's health coach. Generate a personalized daily protocol for a user with the following ANONYMIZED profile:
      - Cycle Phase: ${context.phase} (Day ${context.dayOfCycle})
      - Primary Goal: ${context.goal.replace("_", " ")}
      - Activity Level: ${context.activityLevel}
      - Conditions: ${context.metabolicConditions.join(", ") || "None"}
      - Diet: ${context.dietaryPreferences.join(", ") || "Omnivore"}

      ${goalInstruction}

      The output MUST be valid JSON with the following structure:
      {
        "nutrition": {
          "title": "Short catchy title (e.g., 'Fuel for Follicular')",
          "focus": "Brief focus (e.g., 'Lean Protein & Complex Carbs')",
          "ingredients": [
             { "name": "Ingredient Name", "benefit": "Why it helps", "color": "css color class like 'bg-green-100 text-green-700'" }
             // max 5 items
          ],
          "recipe": {
             "name": "Recipe Name",
             "time": "Time (e.g., 20m)",
             "tags": "Tags (e.g., 'High Protein')"
          }
        },
        "movement": {
          "title": "Movement Type (e.g., 'HIIT', 'Yoga', 'Rest')",
          "focus": "Focus (e.g., 'Cardio & Sweat')",
          "featured_workout": {
             "name": "Workout Name",
             "duration": "Duration",
             "description": "Short description"
          },
          "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"]
        },
        "focus": {
           "title": "Cognitive State",
           "description": "2 sentences on how their brain feels today based on hormones."
        }
      }
    `;
}
