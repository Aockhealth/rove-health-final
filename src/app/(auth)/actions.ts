"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        redirect("/login?error=" + error.message);
    }

    revalidatePath("/", "layout");
    redirect("/cycle-sync");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        options: {
            data: {
                full_name: formData.get("fullName") as string,
            }
        }
    };

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(data);

    if (signUpError) {
        redirect("/signup?error=" + signUpError.message);
    }

    // Attempt to sign in immediately to ensure session is active
    // This handles cases where auto-confirm is enabled but session isn't automatically attached
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (signInError) {
        // If sign in fails (e.g. email verification strictly required), 
        // redirect to login with message
        if (signInError.message.includes("Email not confirmed")) {
            redirect("/login?message=Please check your email to confirm your account.");
        }
        redirect("/signup?error=" + signInError.message);
    }

    // Force creation of profile if it doesn't exist (Backup for trigger failure)
    if (signUpData.user) {
        await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            email: data.email,
            full_name: data.options.data.full_name,
            updated_at: new Date().toISOString(),
        });
    }

    revalidatePath("/", "layout");
    redirect("/onboarding");
}
