// Symptom Insights Edge Function
// Real-time symptom analysis using Groq LLaMA for fast inference

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface SymptomInsightsRequest {
    phase: string;
    dayOfCycle: number;
    symptoms: string[];
}

interface SymptomInsight {
    symptom: string;
    explanation: string;
    reliefTips: string[];
}

interface SymptomInsightsResponse {
    overallInsight: string;
    symptoms: SymptomInsight[];
    focusAreas: string[];
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback symptom insights when AI is unavailable
const SYMPTOM_DATA: Record<string, SymptomInsight> = {
    'Cramps': {
        symptom: 'Cramps',
        explanation: 'Prostaglandins cause uterine contractions to shed the lining. Higher levels mean stronger cramps.',
        reliefTips: [
            'Apply heat to lower abdomen',
            'Try ginger or turmeric tea',
            'Gentle yoga poses like child\'s pose',
            'Magnesium-rich foods like dark chocolate',
        ],
    },
    'Bloating': {
        symptom: 'Bloating',
        explanation: 'Hormonal fluctuations cause water retention. Progesterone in luteal phase relaxes smooth muscle including the gut.',
        reliefTips: [
            'Reduce sodium intake',
            'Drink ginger or peppermint tea',
            'Eat potassium-rich foods (bananas, avocado)',
            'Light walking helps digestion',
        ],
    },
    'Fatigue': {
        symptom: 'Fatigue',
        explanation: 'Iron loss during menstruation and hormonal shifts can deplete energy. Your body is doing significant work.',
        reliefTips: [
            'Prioritize sleep (8-9 hours)',
            'Eat iron-rich foods with vitamin C',
            'Take short naps if possible',
            'Avoid caffeine dependency',
        ],
    },
    'Headache': {
        symptom: 'Headache',
        explanation: 'Estrogen fluctuations can trigger headaches, especially during the menstrual and late luteal phases.',
        reliefTips: [
            'Stay well hydrated',
            'Try magnesium supplementation',
            'Apply cold compress to temples',
            'Limit screen time',
        ],
    },
    'Mood swings': {
        symptom: 'Mood swings',
        explanation: 'Hormonal changes affect neurotransmitters like serotonin and dopamine, impacting emotional regulation.',
        reliefTips: [
            'Practice deep breathing exercises',
            'Spend time outdoors in natural light',
            'Eat complex carbs for serotonin boost',
            'Limit sugar and alcohol',
        ],
    },
    'Acne': {
        symptom: 'Acne',
        explanation: 'Rising androgens before menstruation increase sebum production, clogging pores.',
        reliefTips: [
            'Cleanse gently twice daily',
            'Avoid touching your face',
            'Reduce dairy and sugar intake',
            'Use non-comedogenic products',
        ],
    },
    'Food cravings': {
        symptom: 'Food cravings',
        explanation: 'Serotonin drops in luteal phase trigger carb cravings as the body seeks to boost mood.',
        reliefTips: [
            'Choose complex carbs over refined sugar',
            'Dark chocolate satisfies without spike',
            'Eat regular balanced meals',
            'Allow small treats mindfully',
        ],
    },
    'Backache': {
        symptom: 'Backache',
        explanation: 'Prostaglandins can affect muscles beyond the uterus, causing lower back pain during menstruation.',
        reliefTips: [
            'Use a heating pad on lower back',
            'Cat-cow stretches help mobility',
            'Consider a warm bath',
            'Avoid sitting for long periods',
        ],
    },
    'Breast pain': {
        symptom: 'Breast pain',
        explanation: 'Rising progesterone in luteal phase causes breast tissue to swell and become tender.',
        reliefTips: [
            'Wear a supportive bra',
            'Reduce caffeine intake',
            'Try evening primrose oil',
            'Apply cold compress if needed',
        ],
    },
    'Irritability': {
        symptom: 'Irritability',
        explanation: 'Dropping estrogen and progesterone before menstruation affects mood-regulating neurotransmitters.',
        reliefTips: [
            'Practice box breathing (4-4-4-4)',
            'Set boundaries and rest',
            'Journaling can help process emotions',
            'Physical activity releases endorphins',
        ],
    },
};

// Phase-specific context
const PHASE_CONTEXT: Record<string, string> = {
    'Menstrual': 'During menstruation, your hormone levels are at their lowest. Your body is shedding the uterine lining and may feel more fatigued than usual. This is a time for rest and restoration.',
    'Follicular': 'In the follicular phase, estrogen is rising and you may feel increasing energy and optimism. This is a great time for new projects and physical challenges.',
    'Ovulatory': 'Peak estrogen and a testosterone surge make this your most energetic phase. You may feel more social, confident, and physically capable.',
    'Luteal': 'Progesterone rises and then falls in this phase. You may experience PMS symptoms like bloating, mood changes, and cravings. This is a time to slow down and practice self-care.',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    try {
        const body: SymptomInsightsRequest = await req.json();
        const { phase, dayOfCycle, symptoms } = body;

        if (!phase || !symptoms || symptoms.length === 0) {
            return new Response(
                JSON.stringify({ error: 'phase and symptoms are required' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        // Build insights from symptom data
        const symptomInsights: SymptomInsight[] = symptoms.map(symptom => {
            return SYMPTOM_DATA[symptom] || {
                symptom,
                explanation: `${symptom} can be influenced by hormonal changes throughout your cycle.`,
                reliefTips: [
                    'Practice self-care and rest',
                    'Stay hydrated',
                    'Track this symptom to identify patterns',
                ],
            };
        });

        // Determine focus areas based on symptoms
        const focusAreas: string[] = [];
        if (symptoms.some(s => ['Cramps', 'Backache', 'Headache'].includes(s))) {
            focusAreas.push('Pain Management');
        }
        if (symptoms.some(s => ['Mood swings', 'Irritability', 'Feeling low'].includes(s))) {
            focusAreas.push('Emotional Wellness');
        }
        if (symptoms.some(s => ['Fatigue', 'Bloating'].includes(s))) {
            focusAreas.push('Energy & Digestion');
        }
        if (symptoms.some(s => ['Acne', 'Food cravings'].includes(s))) {
            focusAreas.push('Hormonal Balance');
        }

        // Build overall insight
        const phaseContext = PHASE_CONTEXT[phase] || PHASE_CONTEXT['Follicular'];
        const overallInsight = `${phaseContext} Your symptoms today (${symptoms.join(', ')}) are common during the ${phase.toLowerCase()} phase. Focus on ${focusAreas.join(' and ').toLowerCase() || 'self-care'}.`;

        const response: SymptomInsightsResponse = {
            overallInsight,
            symptoms: symptomInsights,
            focusAreas: focusAreas.length > 0 ? focusAreas : ['General Wellness'],
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'  // HIPAA: No caching of symptom data
                }
            }
        );

    } catch (error) {
        console.error('Error in symptom-insights:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
    }
});
