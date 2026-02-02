"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ProfileAvatar() {
    const [initial, setInitial] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setInitial("U");
                return;
            }

            // Fetch from profiles table where the name is actually stored
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            // Try profile full_name first, then user_metadata, then email
            const name = profile?.full_name
                || user.user_metadata?.full_name
                || user.user_metadata?.name
                || user.email?.split('@')[0];

            if (name && name.length > 0) {
                setInitial(name[0]);
            } else {
                setInitial("U");
            }
        };
        getUser();
    }, []);

    return (
        <Link href="/cycle-sync/profile">
            <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95">
                {initial ? (
                    <span className="font-heading text-lg text-rove-charcoal font-bold">
                        {initial.toUpperCase()}
                    </span>
                ) : (
                    // Loading skeleton
                    <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
                )}
            </div>
        </Link>
    );
}