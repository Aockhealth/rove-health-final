"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: (formData.get("email") as string)?.trim(),
    password: (formData.get("password") as string)?.trim(),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // 1. Extract inputs
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const ageString = (formData.get("age") as string)?.trim();

  // 2. SERVER VALIDATION
  if (!ageString) {
    return { error: "Age is required." };
  }

  const age = parseInt(ageString, 10);

  if (isNaN(age) || age < 13) {
    return { error: "You must be at least 13 years old to sign up." };
  }

  // 3. Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        age: age,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
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
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      privacy_agreed_at: new Date().toISOString() 
    })
    .eq("id", user.id);

  if (error) {
    console.error("Privacy consent error:", error);
  }

  redirect("/onboarding");
}