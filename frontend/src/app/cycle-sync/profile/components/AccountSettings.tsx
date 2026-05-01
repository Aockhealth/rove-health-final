import { useState } from "react";
import { Shield, Mail, LogOut, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AccountSettingsProps {
    email: string;
    phone?: string;
    onLogout: () => void;
    onResetPassword: () => void;
    onUpdateContact: (email: string, phone: string) => void;
    onDeleteAccount: () => void;
    isPending?: boolean;
}

export function AccountSettings({ 
    email, 
    phone, 
    onLogout, 
    onResetPassword, 
    onUpdateContact,
    onDeleteAccount,
    isPending,
}: AccountSettingsProps) {
    // Phase 3: Inline edit form state (replaces window.prompt)
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editEmail, setEditEmail] = useState(email);
    const [editPhone, setEditPhone] = useState(phone || "");
    
    // Phase 4: Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const handleContactSave = () => {
        if (editEmail && (editEmail !== email || editPhone !== phone)) {
            onUpdateContact(editEmail, editPhone);
        }
        setIsEditingContact(false);
    };

    const handleDeleteConfirm = () => {
        if (deleteInput === "DELETE") {
            onDeleteAccount();
            setShowDeleteConfirm(false);
            setDeleteInput("");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-heading text-lg text-stone-800 px-2">Account Management</h3>

            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden divide-y divide-stone-100">
                
                {/* Contact Information — Phase 3: Inline Edit Form */}
                <div className="p-4">
                    <div 
                        onClick={() => !isEditingContact && setIsEditingContact(true)} 
                        className={cn(
                            "flex items-center justify-between transition-colors",
                            !isEditingContact && "cursor-pointer hover:opacity-80"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-stone-700">Contact Information</p>
                                {!isEditingContact && (
                                    <p className="text-xs text-stone-400">
                                        {email} {phone ? `• ${phone}` : "• No phone added"}
                                    </p>
                                )}
                            </div>
                        </div>
                        {!isEditingContact && <ChevronRight className="w-4 h-4 text-stone-300" />}
                    </div>

                    <AnimatePresence>
                        {isEditingContact && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 block">Phone</label>
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="+91 9876543210"
                                            className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button 
                                            onClick={handleContactSave} 
                                            disabled={isPending}
                                            className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-widest"
                                        >
                                            Save
                                        </Button>
                                        <Button 
                                            onClick={() => { setIsEditingContact(false); setEditEmail(email); setEditPhone(phone || ""); }} 
                                            variant="outline" 
                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border-stone-200"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Password & Security */}
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

                {/* Phase 2: Subscription row REMOVED (no payment system exists) */}

                {/* Delete Account — Phase 4: Real Typed Confirmation */}
                <div className="p-4">
                    <div 
                        onClick={() => !showDeleteConfirm && setShowDeleteConfirm(true)} 
                        className={cn(
                            "flex items-center justify-between transition-colors group",
                            !showDeleteConfirm && "cursor-pointer hover:opacity-80"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 group-hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-500">Delete Account</p>
                                <p className="text-xs text-red-300">Permanently remove data</p>
                            </div>
                        </div>
                        {!showDeleteConfirm && <ChevronRight className="w-4 h-4 text-red-200" />}
                    </div>

                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-4 bg-red-50/80 rounded-2xl border border-red-100 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-red-600 leading-relaxed">
                                            This will <strong>permanently delete</strong> your cycle logs, health data, AI insights, and account. This action cannot be undone.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 block">Type DELETE to confirm</label>
                                        <input
                                            value={deleteInput}
                                            onChange={(e) => setDeleteInput(e.target.value)}
                                            placeholder="DELETE"
                                            className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 font-mono tracking-widest"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={handleDeleteConfirm} 
                                            disabled={deleteInput !== "DELETE" || isPending}
                                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40"
                                        >
                                            Delete Forever
                                        </Button>
                                        <Button 
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                                            variant="outline" 
                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border-red-200 text-red-500"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Logout Button */}
            <Button 
                onClick={onLogout} 
                variant="outline" 
                className="w-full border-phase-menstrual/20 text-phase-menstrual/80 hover:text-phase-menstrual hover:bg-phase-menstrual/10 py-6 rounded-xl"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>

            {/* Phase 2: Footer links fixed — now use real <Link> components */}
            <div className="flex justify-center flex-col items-center gap-2">
                <p className="text-[10px] text-stone-300 font-medium uppercase tracking-[0.2em]">Rove Health v1.0.2</p>
                <div className="flex gap-4">
                    <Link href="/privacy" className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">Terms & Privacy</Link>
                    <Link href="/privacy" className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">Privacy</Link>
                </div>
            </div>
        </div>
    );
}