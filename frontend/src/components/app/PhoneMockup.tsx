import Image from "next/image";

export function PhoneMockup() {
  return (
    <div className="relative mx-auto aspect-[9/16] w-56 overflow-hidden rounded-[36px] border-4 border-obsidian bg-taupe-light shadow-xl md:w-64">
      <Image
        src="/app-screenshots/today-snapshot.jpg"
        alt="The Rove app's Today's Snapshot screen"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 224px, 256px"
      />
    </div>
  );
}
