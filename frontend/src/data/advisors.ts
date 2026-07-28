/**
 * Names are real (from the founders' own Our Story copy). Credentials,
 * specialization, and bio are still placeholders — replace before launch.
 */
export interface Advisor {
  name: string;
  credentials: string;
  specialization: string;
  bio: string;
}

export const ADVISORS: Advisor[] = [
  {
    name: "Dr. Aditya Oswal",
    credentials: "[MD, Specialization]",
    specialization: "[Specialization]",
    bio: "Co-founder of Rove Health, based in Mumbai. [Short bio: background and what he brings to the formulas.]",
  },
  {
    name: "Dr. Chaitanya Kalra",
    credentials: "[MD, Specialization]",
    specialization: "[Specialization]",
    bio: "Co-founder of Rove Health, based in Mumbai. [Short bio: background and what he brings to the formulas.]",
  },
];
