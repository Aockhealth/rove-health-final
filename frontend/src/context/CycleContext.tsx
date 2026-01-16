"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchDashboardData } from "@/app/actions/cycle-sync";

// Define the shape of our context data
interface CycleContextType {
    phase: string;
    day: number;
    user: any;
    dashboardData: any; // Store full dashboard response to avoid re-fetching
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export function CycleProvider({ children }: { children: ReactNode }) {
    const [phase, setPhase] = useState<string>("Follicular"); // Default safe state
    const [day, setDay] = useState<number>(1);
    const [user, setUser] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchDashboardData();

            if (data) {
                setDashboardData(data);

                // Handle both string and object phase structures
                const phaseVal = (data as any).phase;
                if (phaseVal) {
                    setPhase(typeof phaseVal === 'string' ? phaseVal : phaseVal.name || "Follicular");
                }

                if ((data as any).day) setDay((data as any).day);
                if ((data as any).user) setUser((data as any).user);
            } else {
                // Handle null data (e.g. redirect to onboarding)
                // We let the page component decide to redirect if data is missing, 
                // but we clear loading state.
            }
        } catch (err) {
            console.error("Failed to load cycle data:", err);
            setError(err instanceof Error ? err.message : 'Unknown error'); // Changed to store string message
        } finally {
            setLoading(false);
        };
    };

    useEffect(() => {
        loadData();
    }, []);

    const value = {
        phase,
        day,
        user,
        dashboardData,
        loading,
        error,
        refreshData: loadData
    };

    return (
        <CycleContext.Provider value={value}>
            {children}
        </CycleContext.Provider>
    );
}

export function useCycle() {
    const context = useContext(CycleContext);
    if (context === undefined) {
        throw new Error("useCycle must be used within a CycleProvider");
    }
    return context;
}
