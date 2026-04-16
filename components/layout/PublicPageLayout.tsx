import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { landingConfig } from "@/config/landing.config";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export default function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <main className="min-h-screen">
      <Navbar config={landingConfig.navigation} />
      <div className="pt-20">
        {children}
      </div>
      <Footer config={landingConfig.footer} />
    </main>
  );
}
