import { LandingNav, LandingHero, LandingFeatures, LandingFooter } from "@/components/landing/landing-page";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />
    </div>
  );
}
