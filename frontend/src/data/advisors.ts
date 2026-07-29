/**
 * Names are real (from the founders' own Our Story copy).
 */
export interface Advisor {
  name: string;
  credentials: string;
  bio: string;
}

export const ADVISORS: Advisor[] = [
  {
    name: "Dr. Aditya Oswal",
    credentials: "MBBS",
    bio: "Co-founder of Rove Health, based in Mumbai.",
  },
  {
    name: "Dr. Chaitanya Kalra",
    credentials: "MBBS",
    bio: "Co-founder of Rove Health, based in Mumbai.",
  },
];
