import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Log in to Rove Health to access your personalized cycle-syncing dashboard, AI-powered insights, and daily plans.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
