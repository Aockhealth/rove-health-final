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
    Moon, Brain, Utensils, Activity, Droplets, Dumbbell,
    Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish,
    Carrot, Wheat, Drumstick, Shield, Pill, Home, FileText,
    Users, Mic, Image, Lightbulb, Star, Music, Bike, Waves, Book, BookOpen, Smartphone, Clock, Beaker, Circle, Leaf,
    Sprout, CircleDot, Cookie, Nut, CupSoda, TreeDeciduous, Cherry, Milk, Bean, Egg, Anchor, Palmtree, Smile, Banana
} from "lucide-react";

// Icon mapping helper - Expanded for Diet Tab needs
export const iconMap: Record<string, any> = {
    "Moon": Moon,
    "Sparkles": Star, // Map Sparkles string to Star to avoid using the Sparkle icon
    "Brain": Brain,
    "Utensils": Utensils,
    "Activity": Activity,
    "Leaf": Leaf,
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
    "Bean": Bean,
    "Sunrise": Sun,
    "Sprout": Sprout,
    "CircleDot": CircleDot,
    "Cookie": Cookie,
    "Nut": Nut,
    "CupSoda": CupSoda,
    "TreeDeciduous": TreeDeciduous,
    "Cherry": Cherry,
    "Milk": Milk,
    "Jar": Beaker, // Fallback for Jar
    "Cheese": Circle, // Fallback for Cheese
    "Egg": Egg,
    "Corn": Wheat, // Fallback for Corn
    "Anchor": Anchor,
    "Palmtree": Palmtree,
    "Smile": Smile,
    "Banana": Banana
};

interface RiverTrackProps {
    items: any[];
    direction?: "left" | "right";
    label: string;
    speed?: number;
    onCardClick?: (item: any) => void;
    cardClass?: string;
}

export function RiverTrack({ items, direction = "left", speed = 20, label, onCardClick, cardClass }: RiverTrackProps) {
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
            // Speed = pixels per second. 
            // delta is ms since last frame. (delta / 1000) gives fraction of a second.
            let moveBy = (direction === "left" ? -1 : 1) * speed * (delta / 1000);

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

    const handleCardClick = (item: any, e: React.MouseEvent) => {
        if (onCardClick) {
            e.stopPropagation();
            onCardClick(item);
        }
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="px-4 md:px-8 mb-2 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</span>
                {!!onCardClick && (
                    <motion.div 
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-full border border-white/80 shadow-sm"
                    >
                        <span className="text-[10px]">✨</span>
                        <span className="text-[9px] font-bold text-rove-stone/80 tracking-wide">Tap cards</span>
                    </motion.div>
                )}
            </div>

            <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-4 md:px-8">
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
                        const Icon = item.icon && typeof item.icon !== 'string' ? item.icon : (iconMap[item.icon as string] || Circle);
                        const isClickable = !!onCardClick && item.detail;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "w-auto min-w-[140px] sm:min-w-[160px] md:min-w-[180px] flex-shrink-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm flex items-center gap-2 sm:gap-3 transition-all select-none will-change-transform",
                                    cardClass || "bg-white/95 border border-white/50",
                                    isClickable
                                        ? "cursor-pointer hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                                        : "pointer-events-none"
                                )}
                                onClick={(e) => isClickable && handleCardClick(item, e)}
                            >
                                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm transition-transform", item.bg || "bg-white", item.color)}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-heading text-xs sm:text-sm font-semibold text-rove-charcoal leading-tight whitespace-nowrap">{item.title}</h4>
                                    <p className="text-rove-charcoal/60 text-[10px] sm:text-xs font-medium whitespace-nowrap">{item.desc || item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
