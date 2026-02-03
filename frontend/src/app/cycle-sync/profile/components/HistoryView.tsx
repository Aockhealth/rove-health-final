import { History, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
    theme: any;
}

export function HistoryView({ theme }: HistoryViewProps) {
    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-heading text-lg text-stone-800">History</h3>
                <button className={cn("text-xs font-bold uppercase tracking-wider", theme.accent)}>View All</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 rounded-2xl p-4 border border-white/60 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-stone-700">Weight Log</span>
                        <span className="text-[10px] text-stone-400">Last: 2 days ago</span>
                    </div>
                </div>
                <div className="bg-white/50 rounded-2xl p-4 border border-white/60 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-stone-700">Cycle History</span>
                        <span className="text-[10px] text-stone-400">6 Cycles Logged</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
