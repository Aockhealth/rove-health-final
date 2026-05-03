import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TrackerAccordionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  summary?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
  themeColor?: string;
}

export default function TrackerAccordion({
  id,
  title,
  icon: Icon,
  summary,
  isOpen,
  onToggle,
  children,
  themeColor = "#A8A29E" // default stone color
}: TrackerAccordionProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border shadow-sm overflow-hidden mb-4 transition-all duration-300">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-300"
            style={{
              backgroundColor: isOpen ? `${themeColor}20` : `${themeColor}10`,
              color: themeColor,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">
              {title}
            </h3>
            {summary && !isOpen && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {summary}
              </p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-5 pb-5 sm:pb-6 pt-0 space-y-2 divide-y divide-gray-100/60">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
