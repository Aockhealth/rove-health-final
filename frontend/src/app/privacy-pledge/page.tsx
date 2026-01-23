"use client";

import { useState, useTransition } from "react";
import { 
  ChevronDown, 
  ArrowRight, 
  Loader2 
} from "lucide-react";
import Image from "next/image"; 
import { Inter, Outfit } from "next/font/google";
// ✅ 1. Import the real server action
import { acceptPrivacyPolicy } from "@backend/actions/auth/auth-actions";

// 2. Configure the fonts
const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });

const sections = [
  {
    id: 1,
    title: "We Do Not Sell Your Data",
    content: "We will never sell, trade, or share your health data with third parties for marketing. Our business is built on subscriptions, not selling your secrets.",
    colorScheme: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600" },
  },
  {
    id: 2,
    title: '"De-Linked" Identity (The Firewall)',
    content: "Your identity and your health data live in separate encrypted systems. Even our admins cannot read your health logs by default.",
    colorScheme: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-600" },
  },
  {
    id: 3,
    title: 'AI Privacy: We "Scrub" Before We Send',
    content: "Before AI sees anything, we remove identifiers. Dates become cycle days. Notes become anonymous tags. Your diary stays yours.",
    colorScheme: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
  },
  {
    id: 4,
    title: "HIPAA-Level Security Standards",
    content: "Your data is encrypted at rest and in transit, using the same standards as medical-grade software.",
    colorScheme: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600" },
  },
  {
    id: 5,
    title: "You Hold the Keys",
    content: "You can delete, export, or disable features anytime. Real privacy means control stays with you.",
    colorScheme: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
  },
];

export default function PrivacyPledge() {
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggleSection = (id: number) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAgree = () => {
    startTransition(async () => {
      // ✅ 2. Use the real action instead of setTimeout
      // This will update the DB and automatically redirect to /onboarding
      await acceptPrivacyPolicy();
    });
  };

  return (
    <>
      {/* 3. Removed `jsx global` to prevent hydration mismatches. 
          Using standard CSS for the keyframes.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-move 6s ease infinite;
        }
      `}} />

      {/* 4. Applied the Inter font class here */}
      <div className={`min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center px-4 py-4 ${inter.className}`}>
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header Area */}
          <div className="border-b border-gray-100">
            
            <div className="w-full py-2 flex justify-center items-center bg-gradient-to-r from-teal-300 via-emerald-100 to-teal-400 animate-gradient-bg">
              <div className="relative w-full max-w-2xl aspect-[4/2]">
                <Image
                  src="/assets/Data-privacy.png" 
                  alt="Rove Privacy Promise"
                  fill
                  priority
                  className="object-contain drop-shadow-sm" 
                />
              </div>
            </div>

            <div className="px-6 py-2 text-center">
              {/* 5. Applied the Outfit font class here */}
              <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-2 ${outfit.className}`}>
                The Rove Privacy Promise
              </h1>
              <p className="text-sm text-gray-600">
                Plain English. No jargon. <span className="font-semibold text-gray-800">This one protects you.</span>
              </p>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="p-4 space-y-2">
            {sections.map((section) => {
              const isOpen = openSections.includes(section.id);
              return (
                <div
                  key={section.id}
                  className={`border-2 rounded-xl transition-all ${
                    isOpen
                      ? `${section.colorScheme.border} ${section.colorScheme.bg}`
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 6. Applied Outfit font class here */}
                      <h3 className={`font-bold text-gray-900 text-sm ${outfit.className}`}>
                        {section.id}. {section.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pl-8 md:pl-10">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleAgree}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-300 via-rose-100 to-rose-400 text-gray-900 font-semibold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Securing Data...
                </span>
              ) : (
                <span className="flex justify-center items-center gap-2">
                  I Understand & Agree <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-3">
              Questions? Email{" "}
              <span className="text-rose-500 font-medium hover:underline cursor-pointer">
                rovehealthofficial@gmail.com
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}