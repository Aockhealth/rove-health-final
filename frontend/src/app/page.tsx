import { Hero } from "@/components/home/Hero";
import { ProblemStatement } from "@/components/home/ProblemStatement";
import { Philosophy } from "@/components/home/Philosophy";
import { RiverMoment } from "@/components/home/RiverMoment";
import { TrustMarks } from "@/components/home/TrustMarks";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStatement />
      <Philosophy />
      <RiverMoment />
      <TrustMarks />
      <FinalCta />
    </>
  );
}
