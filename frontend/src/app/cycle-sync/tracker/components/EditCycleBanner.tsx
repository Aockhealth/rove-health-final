import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X } from "lucide-react";

interface EditCycleBannerProps {
    isEditingCycle: boolean;
    onUpdate: () => void;
    onClose: () => void;
}

export default function EditCycleBanner({ isEditingCycle, onUpdate, onClose }: EditCycleBannerProps) {
    return (
        <AnimatePresence>
            {isEditingCycle && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl p-5 border border-rose-100"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Update Period Start Date</h3>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                Select the correct start date of your last period on the calendar, then update to recalibrate predictions.
                            </p>
                            <button
                                onClick={onUpdate}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Update Start Date
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}