"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// ✅ 1. Define Schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.coerce.number().min(13, "Must be at least 13").max(100, "Invalid age"),
});

export async function login(formData: FormData) {
  // ✅ 2. Validate Input
  const rawData = {
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString().trim(),
  };

  const validation = LoginSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signup(formData: FormData) {
  // ✅ 3. Validate Input
  const rawData = {
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString().trim(),
    age: formData.get("age"), // Zod coerce will handle string -> number conversion
  };

  const validation = SignupSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { email, password, age } = validation.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        age,
      },
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("❌ SIGNUP FAILED:", error.message);
    return { error: error.message };
  }

  if (data?.user) {
    revalidatePath("/", "layout");
    return { success: true };
  }

  return { error: "Check your email to verify your account." };
}

// Kept this as is (redirects are fine here if not wrapped in try/catch on client)
export async function acceptPrivacyPolicy() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      privacy_agreed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Privacy consent error:", error);
  }

  redirect("/onboarding");
}
