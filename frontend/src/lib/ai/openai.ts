import OpenAI from 'openai';

// Create an instance of the OpenAI client
// It automatically uses process.env.OPENAI_API_KEY
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false, // Ensure this is only used server-side
});

// Helper for model selection
export const OPENAI_MODEL = "gpt-4o"; // Or "gpt-3.5-turbo" for cost efficiency
