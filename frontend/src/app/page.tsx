import { Hero } from "@/components/home/Hero";
import { ProblemStatement } from "@/components/home/ProblemStatement";
import { Philosophy } from "@/components/home/Philosophy";
import { TrustMarks } from "@/components/home/TrustMarks";
import { HomeFaq } from "@/components/home/HomeFaq";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStatement />
      <Philosophy />
      <TrustMarks />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
