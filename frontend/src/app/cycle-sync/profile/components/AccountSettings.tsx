import { Shield, Lock, CreditCard, Mail, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AccountSettingsProps {
    email: string;
    onLogout: () => void;
}

export function AccountSettings({ email, onLogout }: AccountSettingsProps) {
    const handleResetPassword = () => {
        alert("A password reset link has been sent to " + email);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-heading text-lg text-stone-800 px-2">Account Management</h3>

            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden divide-y divide-stone-100">
                {/* Email Section */}
                <div onClick={() => alert("Email cannot be changed in this beta version.")} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-700">Email Address</p>
                            <p className="text-xs text-stone-400">{email}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>

                {/* Password/Security */}
                <div onClick={handleResetPassword} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-700">Login & Security</p>
                            <p className="text-xs text-stone-400">Manage Password</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>

                {/* Subscription */}
                <div className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-700">Subscription</p>
                            <p className="text-xs text-amber-600 font-medium">Free Plan</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md">Upgrade</span>
                </div>
            </div>

            <Button onClick={onLogout} variant="outline" className="w-full border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 py-6 rounded-xl">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>

            <div className="flex justify-center flex-col items-center gap-2">
                <p className="text-[10px] text-stone-300 font-medium uppercase tracking-[0.2em]">Rove Health v1.0.2</p>
                <div className="flex gap-4">
                    <span className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer">Terms</span>
                    <span className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer">Privacy</span>
                </div>
            </div>
        </div>
    );
}
