import { HeroSection } from "../components/ui/HeroSection";

export function LandingPage() {
    return (
        <HeroSection
            ctaHref="/signin"
            showNavbar={true}
        />
    );
}
