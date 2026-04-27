"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function AppLayoutWrapper({
    children,
    user
}: {
    children: React.ReactNode;
    user: any;
}) {
    const pathname = usePathname();
    const isAppMode = pathname?.startsWith("/cycle-sync");

    if (isAppMode) {
        return <>{children}</>;
    }

    return (
        <>
            <Header user={user} />
            <div className="pt-16">
                {children}
            </div>
        </>
    );
}
