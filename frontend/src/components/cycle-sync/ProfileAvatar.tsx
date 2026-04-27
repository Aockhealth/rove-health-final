"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "lucide-react";

export default function ProfileAvatar() {
    const [initial, setInitial] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Use server action for reliable fetching
                const { getHeaderProfile } = await import("@/app/cycle-sync/profile/actions");
                const data = await getHeaderProfile();

                if (data?.name && data.name.length > 0) {
                    setInitial(data.name[0]);
                } else {
                    setInitial(null); // Fallback to User icon
                }
            } catch (e) {
                console.error("Failed to load profile avatar", e);
                setInitial(null);
            }
        };
        loadProfile();
    }, []);

    return (
        <Link href="/cycle-sync/profile">
            <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95">
                {initial ? (
                    <span className="font-heading text-lg text-rove-charcoal font-bold">
                        {initial.toUpperCase()}
                    </span>
                ) : (
                    <User className="w-5 h-5 text-rove-stone/50" />
                )}
            </div>
        </Link>
    );
}