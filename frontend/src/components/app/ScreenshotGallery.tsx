import Image from "next/image";

const SCREENSHOTS = [
  { src: "/app-screenshots/today-snapshot.jpg", caption: "Today's Snapshot" },
  { src: "/app-screenshots/current-cycle.jpg", caption: "Your Current Cycle" },
  { src: "/app-screenshots/patterns-of-month.jpg", caption: "Patterns of the Month" },
  { src: "/app-screenshots/blueprint-of-rhythm.jpg", caption: "The Blueprint of Your Rhythm" },
  { src: "/app-screenshots/rove-chef-recipes.jpg", caption: "Recipes to Feed Your Phase" },
  { src: "/app-screenshots/skin-and-sustenance.jpg", caption: "Skin and Sustenance" },
  { src: "/app-screenshots/pattern-analysis.jpg", caption: "Scientific Insight, Gently Delivered" },
];

export function ScreenshotGallery() {
  return (
    <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-6 px-6 pb-4">
      {SCREENSHOTS.map(({ src, caption }) => (
        <figure key={src} className="shrink-0 snap-start">
          <div className="relative aspect-[9/16] w-[220px] overflow-hidden rounded-[24px] border-4 border-obsidian bg-taupe-light shadow-lg md:w-[250px]">
            <Image
              src={src}
              alt={caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 220px, 250px"
            />
          </div>
          <figcaption className="mt-3 text-center font-sans text-xs font-medium text-obsidian/60">
            {caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
