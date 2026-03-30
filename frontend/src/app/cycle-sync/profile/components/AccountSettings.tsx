import { Shield, Mail, LogOut, ChevronRight, CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AccountSettingsProps {
    email: string;
    phone?: string;
    onLogout: () => void;
    onResetPassword: () => void;
    onUpdateContact: (email: string, phone: string) => void;
    onDeleteAccount: () => void;
}

export function AccountSettings({ 
    email, 
    phone, 
    onLogout, 
    onResetPassword, 
    onUpdateContact,
    onDeleteAccount 
}: AccountSettingsProps) {
    
    // Logic to handle updating both email and phone via simple prompts
    const handleContactClick = () => {
        const newEmail = prompt("Update Email Address:", email);
        const newPhone = prompt("Update Phone Number:", phone || "");
        
        // Only trigger update if something actually changed and email isn't empty
        if (newEmail && (newEmail !== email || newPhone !== phone)) {
            onUpdateContact(newEmail, newPhone || "");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-heading text-lg text-stone-800 px-2">Account Management</h3>

            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden divide-y divide-stone-100">
                
                {/* Contact Information Section (Replaces the old Email alert) */}
                <div 
                    onClick={handleContactClick} 
                    className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-700">Contact Information</p>
                            <p className="text-xs text-stone-400">
                                {email} {phone ? `• ${phone}` : "• No phone added"}
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>

                {/* Password & Security Section */}
                <div 
                    onClick={onResetPassword} 
                    className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-700">Login & Security</p>
                            <p className="text-xs text-stone-400">Request Password Reset</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>

                {/* Subscription Section */}
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

                {/* Delete Account Section */}
                <div 
                    onClick={onDeleteAccount} 
                    className="p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 group-hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-500">Delete Account</p>
                            <p className="text-xs text-rose-300">Permanently remove data</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-200" />
                </div>
            </div>

            {/* Logout Button */}
            <Button 
                onClick={onLogout} 
                variant="outline" 
                className="w-full border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 py-6 rounded-xl"
            >
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