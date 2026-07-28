"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { cn } from "@/lib/utils";
import { LOCAL_PRODUCTS } from "@/data/products";

const [rise, restore, balance] = LOCAL_PRODUCTS;

function CardShell({
  href,
  delay = 0,
  className,
  children,
}: {
  href?: string;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sharedClassName = cn(
    "group relative flex flex-col justify-end overflow-hidden rounded-[20px] bg-white-bone p-6 transition-all duration-700 ease-out",
    href && "hover:-translate-y-0.5",
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    className
  );

  if (!href) {
    return (
      <div ref={ref} className={sharedClassName} style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}>
        {children}
      </div>
    );
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={sharedClassName}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Link>
  );
}

export function SystemBento() {
  return (
    <section className="bg-rove-plum px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-white-bone/50">
            The System
          </span>
          <h2 className="mt-4 font-serif text-4xl italic font-medium leading-tight text-white-bone md:text-5xl">
            Everything your cycle needs.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-4 md:grid-rows-2 md:auto-rows-fr">
          <CardShell delay={0} className="md:col-span-2 md:row-span-2 aspect-square md:aspect-auto">
            <div className="absolute inset-0">
              <Image src={rise.image} alt={rise.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/10 to-transparent" />
            </div>
            <div className="relative">
              <Badge variant="neutral" className="bg-obsidian/55 text-white-bone backdrop-blur-sm">
                Coming Soon
              </Badge>
              <h3 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-white-bone">
                {rise.title}
              </h3>
              <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-white-bone/80">
                Energy and momentum as your body builds through menses and follicular.
              </p>
            </div>
          </CardShell>

          <CardShell delay={120} className="md:col-span-2 aspect-[4/3] md:aspect-auto">
            <div className="absolute inset-0">
              <Image src={restore.image} alt={restore.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/10 to-transparent" />
            </div>
            <div className="relative">
              <Badge variant="neutral" className="bg-obsidian/55 text-white-bone backdrop-blur-sm">
                Coming Soon
              </Badge>
              <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight text-white-bone">
                {restore.title}
              </h3>
              <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-white-bone/80">
                Calm and comfort through the luteal wind-down.
              </p>
            </div>
          </CardShell>

          <CardShell
            href={`/shop/${balance.handle}`}
            delay={220}
            className="aspect-square md:aspect-auto"
          >
            <div className="absolute inset-0">
              <Image src={balance.image} alt={balance.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-obsidian/15 to-transparent" />
            </div>
            <div className="relative">
              <Badge variant={balance.phaseVariant} className="bg-obsidian/55 text-white-bone backdrop-blur-sm">
                Irregular + PMOS
              </Badge>
              <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight text-white-bone">
                {balance.title}
              </h3>
            </div>
          </CardShell>

          <CardShell href="/app" delay={320} className="aspect-square md:aspect-auto bg-white-bone">
            <AnimatedBackground phases={["ovulatory", "follicular"]} />
            <Smartphone
              className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-obsidian/10"
              strokeWidth={1.25}
            />
            <div className="relative">
              <Badge variant="neutral">Free to use</Badge>
              <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight text-obsidian">
                The Cycle Sync App
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/70">
                Know exactly which phase you&apos;re in, and what to reach for.
              </p>
            </div>
          </CardShell>
        </div>
      </div>
    </section>
  );
}
