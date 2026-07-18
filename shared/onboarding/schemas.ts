import { z } from "zod";

export const symptomSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(["Physical", "Emotional"]),
  severity: z.number().int().min(0).max(10),
});

export const periodRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const onboardingSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth is required"),
  goals: z.array(z.string().trim().min(1)).min(1),
  conditions: z.array(z.string().trim().min(1)).default([]),
  symptoms: z.array(symptomSchema).default([]),
  periodHistory: z.array(periodRangeSchema).default([]),
  lastPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cycleLength: z.number().int().min(15).max(90),
  periodLength: z.number().int().min(1).max(15),
  isIrregular: z.boolean(),
  trackerMode: z.enum(["menstruation", "ttc", "menopause"]).optional(),
  heightCm: z.number().min(100).max(250).nullable().optional(),
  weightKg: z.number().min(20).max(300).nullable().optional(),
  dietPreference: z.string().max(50).optional(),
  privacyConsented: z.boolean().refine((v) => v === true, "Privacy consent is required"),
});
