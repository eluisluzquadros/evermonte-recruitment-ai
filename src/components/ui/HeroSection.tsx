import * as React from "react"
import { useTranslation } from "react-i18next"
import { cn } from "../../lib/utils"
import { ChevronRight, Sparkles, Briefcase, MapPin, Globe } from "lucide-react"
import { ThemeToggle } from "../ThemeToggle"
import { LanguageSwitcher } from "./LanguageSwitcher"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    subtitle?: {
        regular: string
        gradient: string
    }
    description?: string
    ctaText?: string
    ctaHref?: string
    showNavbar?: boolean
}

/**
 * Neural Network Background Effect
 */
const NeuralNetworkBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 animate-pulse"
                style={{ animationDuration: '8s' }} />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(120, 200, 200, 0.15) 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }}
            />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="neural-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                        <path d="M 0 100 Q 50 50 100 100 T 200 100" stroke="rgba(100, 200, 200, 0.1)" strokeWidth="1" fill="none" />
                        <path d="M 100 0 Q 150 50 100 100 T 100 200" stroke="rgba(100, 200, 200, 0.1)" strokeWidth="1" fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-pattern)" />
            </svg>
        </div>
    )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
    (
        {
            className,
            ctaHref = "/signin",
            showNavbar = true,
            ...props
        },
        ref,
    ) => {
        const { t } = useTranslation();

        return (
            <div className={cn("relative min-h-screen bg-background text-foreground transition-colors duration-500", className)} ref={ref} {...props}>
                {/* Neural Network Background */}
                <NeuralNetworkBackground />

                {/* Navbar */}
                {showNavbar && (
                    <nav className="relative z-20 border-b border-border bg-background/80 backdrop-blur-lg">
                        <div className="mx-auto max-w-7xl px-6 py-4">
                            <div className="flex items-center justify-between">
                                {/* Logo */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold tracking-tight text-foreground">Evermonte AI-Headhunter</span>
                                </div>

                                {/* Navigation Links */}
                                <div className="hidden md:flex items-center gap-6">
                                    <a href="https://evermonte.com/" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium">
                                        Evermonte
                                    </a>
                                    <a href="https://einstitute.com.br/" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium">
                                        Institute
                                    </a>
                                    <ThemeToggle />
                                    <LanguageSwitcher />
                                </div>

                                {/* CTA Button - Single Login */}
                                <a
                                    href={ctaHref}
                                    className="hidden md:block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    {t('nav.signin')}
                                </a>
                            </div>
                        </div>
                    </nav>
                )}

                {/* Hero Content */}
                <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:py-40">
                    <div className="mx-auto max-w-4xl text-center space-y-10">
                        {/* AI Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-500 dark:text-teal-300 backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI-Powered by Gemini
                        </div>

                        {/* Main Heading - Using structured title lines */}
                        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                            <span className="text-foreground">
                                {t('hero.title_line1')}
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-blue-700 bg-clip-text text-transparent">
                                {t('hero.title_line2')}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl sm:text-2xl text-muted-foreground font-medium italic">
                            {t('hero.subtitle')}
                        </p>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            {t('hero.description')}
                        </p>

                        {/* CTA Button */}
                        <div className="flex justify-center pt-4">
                            <a
                                href={ctaHref}
                                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-105"
                            >
                                {t('login')}
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Offices Section */}
                <div className="relative z-10 border-t border-border bg-background/60 backdrop-blur-sm py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-10">
                            Our Offices
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { city: 'São Paulo | SP', address: 'Av. Brigadeiro Faria de Lima, 3729' },
                                { city: 'Porto Alegre | RS', address: 'Rua Manoelito de Ornellas, 55' },
                                { city: 'Curitiba | PR', address: 'Praça São Paulo da Cruz, 50' },
                                { city: 'Joinville | SC', address: 'Rua Ministro Calógeras, 343' }
                            ].map((office) => (
                                <div key={office.city} className="flex flex-col items-center gap-2 group cursor-default">
                                    <MapPin className="w-6 h-6 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
                                    <div className="text-lg font-bold text-foreground">
                                        {office.city}
                                    </div>
                                    <div className="text-xs text-muted-foreground max-w-[150px]">
                                        {office.address}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Institute Section */}
                <div className="relative z-10 border-t border-border bg-gradient-to-b from-background to-background/80 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-600 dark:text-teal-300">
                                    <Globe className="h-3.5 w-3.5" />
                                    KNOWLEDGE DRIVES RESULTS
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    Evermonte Institute
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    London, Brazil, and the future of executive search.
                                    The Evermonte Institute is our intelligence platform analyzing global governance, succession,
                                    and leadership trends to prepare your company for 2026 and beyond.
                                </p>
                                <a
                                    href="https://einstitute.com.br/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                                >
                                    Access Institute <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>
                            <div className="relative h-64 md:h-full min-h-[300px] rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50 flex items-center justify-center text-center group">
                                <img
                                    src="/images/footer-bg.png"
                                    alt="Professional Success"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 border-t border-border bg-background py-12">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-500 rounded flex items-center justify-center">
                                <Briefcase className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-muted-foreground">Evermonte AI-Headhunter</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 Evermonte Executive Search. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        )
    },
)

HeroSection.displayName = "HeroSection"

export { HeroSection }
