import { useRef, useState, useEffect, useCallback } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    useSpring,
    useVelocity,
    wrap,
    useDragControls
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Moon, Sparkles, Brain, Utensils, Activity, Droplets, Dumbbell,
    Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish,
    Carrot, Wheat, Drumstick, Shield, Pill, Home, FileText,
    Users, Mic, Image, Lightbulb, Star, Music, Bike, Waves, Book, BookOpen, Smartphone, Clock, Beaker, Circle, Leaf
} from "lucide-react";

// Icon mapping helper - Expanded for Diet Tab needs
export const iconMap: Record<string, any> = {
    "Moon": Moon,
    "Sparkles": Sparkles,
    "Brain": Brain,
    "Utensils": Utensils,
    "Activity": Activity,
    "Leaf": Droplets, // Fallback or specific
    "Droplets": Droplets,
    "Dumbbell": Dumbbell,
    "Zap": Zap,
    "Sun": Sun,
    "TrendingUp": TrendingUp,
    "Heart": Heart,
    "Wind": Wind,
    "Coffee": Coffee,
    "Soup": Soup,
    "Fish": Fish,
    "Carrot": Carrot,
    "Wheat": Wheat,
    "Drumstick": Drumstick,
    "Shield": Shield,
    "Pill": Pill,
    "Home": Home,
    "FileText": FileText,
    "Users": Users,
    "Mic": Mic,
    "Image": Image,
    "Lightbulb": Lightbulb,
    "Star": Star,
    "Music": Music,
    "Bike": Bike,
    "Waves": Waves,
    "Book": Book,
    "BookOpen": BookOpen,
    "Smartphone": Smartphone,
    "Clock": Clock,
    "Beaker": Beaker,
    "Circle": Circle,
    "Bean": Utensils, // Fallback
    "Sunrise": Sun
};

interface RiverTrackProps {
    items: any[];
    direction?: "left" | "right";
    speed?: number;
    label: string;
}

export function RiverTrack({ items, direction = "left", speed = 20, label }: RiverTrackProps) {
    // Duplicate items for seamless loop (4x for smoothness)
    const riverItems = [...items, ...items, ...items, ...items];

    // Animation Logic
    const baseX = useMotionValue(0);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);

    // Measure content width for wrapping
    useEffect(() => {
        if (containerRef.current) {
            // Rough estimate: item width (approx 200px) * count / 4 (since we duplicated)
            // Better: Measure one 'set' of items
            const singleSetWidth = (containerRef.current.scrollWidth / 4);
            setContentWidth(singleSetWidth);
        }
    }, [riverItems.length]);

    useAnimationFrame((t, delta) => {
        if (!isPaused && contentWidth > 0) {
            let moveBy = (direction === "left" ? -1 : 1) * (speed / 1000) * delta;

            // Adjust speed factor separately
            const velocityFactor = 0.5; // Base speed
            moveBy = (direction === "left" ? -1 : 1) * velocityFactor;

            let newX = baseX.get() + moveBy;

            // Wrap logic involves checking boundaries 
            if (newX <= -contentWidth) {
                newX += contentWidth;
            } else if (newX >= 0) {
                newX -= contentWidth;
            }

            baseX.set(newX);
        }
    });

    return (
        <div className="w-full overflow-hidden">
            <div className="px-4 md:px-8 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</span>
            </div>

            <div className="relative overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.div
                    ref={containerRef}
                    className="flex gap-3 w-max"
                    style={{ x: baseX }}
                    drag="x"
                    dragConstraints={{ left: -1000, right: 1000 }} // Loose constraints, wrapping handles limits
                    onDragStart={() => setIsPaused(true)}
                    onDragEnd={() => setIsPaused(false)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {riverItems.map((item, i) => {
                        const Icon = item.icon && typeof item.icon !== 'string' ? item.icon : (iconMap[item.icon as string] || Sparkles);

                        return (
                            <div key={i} className="w-auto min-w-[180px] flex-shrink-0 p-2.5 rounded-[1.25rem] bg-white/40 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-3 hover:bg-white/60 transition-colors pointer-events-none select-none">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform", item.bg || "bg-white", item.color)}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-heading text-sm text-rove-charcoal leading-tight whitespace-nowrap">{item.title}</h4>
                                    <p className="text-rove-stone text-[9px] whitespace-nowrap">{item.desc || item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
