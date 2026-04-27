import { Scale, Ruler, Activity, Apple, Dumbbell, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LuxurySelect } from "./LuxurySelect";
import { useState } from "react";

interface HealthPassportProps {
    formData: any;
    setFormData: (data: any) => void;
    onSave: () => void;
    isPending: boolean;
    theme: any;
}

export function HealthPassport({ formData, setFormData, onSave, isPending, theme }: HealthPassportProps) {
    const [isAddingCondition, setIsAddingCondition] = useState(false);
    const [newCondition, setNewCondition] = useState("");

    const addCondition = () => {
        if (newCondition.trim()) {
            setFormData({ ...formData, conditions: [...formData.conditions, newCondition.trim()] });
            setNewCondition("");
            setIsAddingCondition(false);
        }
    };

    const removeCondition = (condition: string) => {
        setFormData({ ...formData, conditions: formData.conditions.filter((c: string) => c !== condition) });
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-lg p-8 relative overflow-hidden group">
            {/* Decorative background icon */}
            <div className="absolute -right-8 -top-8 text-stone-50 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                <Activity className="w-64 h-64" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm", theme.bg)}>
                        <Activity className={cn("w-5 h-5", theme.accent)} />
                    </div>

                    <div>
                        <h3 className="font-heading text-xl text-stone-800">Health Passport</h3>
                        <p className="text-xs text-stone-400 mt-0.5">Primary biomarkers & conditions</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Physical Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative group/input">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                                <Scale className="w-3 h-3" /> Weight (kg)
                            </label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                                className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 font-heading text-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                                <Ruler className="w-3 h-3" /> Height (cm)
                            </label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                                className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 font-heading text-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                            />
                        </div>
                    </div>

                    {/* Dropdowns / Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LuxurySelect
                            label="Activity Level"
                            icon={Dumbbell}
                            value={formData.activity_level}
                            onChange={(val) => setFormData({ ...formData, activity_level: val })}
                            options={[
                                { value: "sedentary", label: "Sedentary" },
                                { value: "moderate", label: "Moderate" },
                                { value: "active", label: "Active" },
                                { value: "athlete", label: "Athlete" }
                            ]}
                            tooltip="Determines caloric burn & recovery needs across phases."
                        />
                        <LuxurySelect
                            label="Diet Type"
                            icon={Apple}
                            value={formData.diet_preference}
                            onChange={(val) => setFormData({ ...formData, diet_preference: val })}
                            options={[
                                { value: "vegetarian", label: "Vegetarian" },
                                { value: "non_veg", label: "Non-Vegetarian" },
                                { value: "vegan", label: "Vegan" },
                                { value: "jain", label: "Jain" }
                            ]}
                            tooltip="Adjusts iron & protein recommendations for your phase."
                        />
                    </div>

                    {/* Conditions */}
                    <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Conditions Managed</span>
                        <div className="flex flex-wrap gap-2">
                            {formData.conditions?.map((c: string) => (
                                <button key={c} onClick={() => removeCondition(c)} className="group px-3 py-1.5 rounded-full bg-phase-menstrual/10 text-phase-menstrual text-xs font-bold border border-phase-menstrual/20 flex items-center gap-1 hover:bg-phase-menstrual/20 transition-colors">
                                    {c}
                                    <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}

                            {!isAddingCondition ? (
                                <button onClick={() => setIsAddingCondition(true)} className="px-3 py-1.5 rounded-full bg-stone-50 text-stone-400 text-xs font-bold border border-stone-200 border-dashed hover:border-stone-400 hover:text-stone-600 transition-all">
                                    + Add
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                    <input
                                        value={newCondition}
                                        onChange={(e) => setNewCondition(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                                        autoFocus
                                        className="w-32 bg-stone-50 border-b border-stone-300 px-2 py-1 text-xs focus:outline-none"
                                        placeholder="Condition..."
                                    />
                                    <button onClick={addCondition} className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={onSave}
                        disabled={isPending}
                        className="w-full py-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                    >
                        Save Passport Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
