// import { redirect } from "next/navigation";
import Footer from "@/components/home/Footer";
import HeroSection from "@/components/home/HeroSection";
import Navbar from "@/components/home/Navbar";
import DESScoreSection from "@/components/home/DESScoreSection";
import SkillVerificationJourney from "@/components/home/SkillVerificationJourney";
import StakeholderEcosystem from "@/components/home/StakeholderEcosystem";
import DataPrivacySection from "@/components/home/DataPrivacySection";

export default function Home() {
  return (
    <main className="flex-1 min-h-screen flex flex-col">
      <Navbar />

      <div className="w-[90%] max-w-[95%] mx-auto flex flex-col gap-[64px] py-8 lg:py-12">
        <HeroSection />
        <DESScoreSection />
        <SkillVerificationJourney />
        <StakeholderEcosystem />
        <DataPrivacySection />
      </div>

      <Footer />
    </main>
  )
}
