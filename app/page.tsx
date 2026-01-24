// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE - FINESI Dirección de Investigación
// Página institucional que ensambla todas las secciones desde la configuración
// ═══════════════════════════════════════════════════════════════════════════════

import { landingConfig } from "@/config/landing.config";

// Layout Components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Section Components
import Hero from "@/components/sections/Hero";
import Announcements from "@/components/sections/Announcements";
import Research from "@/components/sections/Research";
import Documents from "@/components/sections/Documents";
import Offices from "@/components/sections/Offices";
import Authorities from "@/components/sections/Authorities";
import Gallery from "@/components/sections/Gallery";
import Calendar from "@/components/sections/Calendar";
// import FAQ from "@/components/sections/FAQ"; // COMENTADO: Sección FAQ desactivada

// Animation Components
import { ScrollProgressWrapper } from "@/components/ui/scroll-progress-wrapper";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Scroll Progress Indicator */}
      <ScrollProgressWrapper />

      {/* Navigation */}
      <Navbar config={landingConfig.navigation} />

      {/* Hero Section - Institucional */}
      <Hero config={landingConfig.hero} />

      {/* Announcements Section - Anuncios y Convocatorias */}
      {landingConfig.announcements && (
        <Announcements config={landingConfig.announcements} />
      )}

      {/* Research Lines Section - Líneas de Investigación */}
      {landingConfig.research && (
        <Research config={landingConfig.research} />
      )}

      {/* Documents Section - Documentos y Formatos */}
      {landingConfig.documents && (
        <Documents config={landingConfig.documents} />
      )}

      {/* Calendar Section - Calendario de Eventos */}
      {landingConfig.calendar && (
        <Calendar config={landingConfig.calendar} />
      )}

      {/* Gallery Section - Galería de Fotos */}
      {landingConfig.gallery && (
        <Gallery config={landingConfig.gallery} />
      )}

      {/* Authorities Section - Autoridades */}
      {landingConfig.authorities && (
        <Authorities config={landingConfig.authorities} />
      )}

      {/* Offices Section - Oficinas y Contacto */}
      {landingConfig.offices && (
        <Offices config={landingConfig.offices} />
      )}

      {/* FAQ Section - Preguntas Frecuentes */}
      {/* COMENTADO: Sección FAQ desactivada
      {landingConfig.faq && <FAQ config={landingConfig.faq} />}
      */}

      {/* Footer */}
      <Footer config={landingConfig.footer} />
    </main>
  );
}
