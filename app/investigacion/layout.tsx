import PublicPageLayout from "@/components/layout/PublicPageLayout";

// Nota: La navegación sub-sección se maneja ahora desde `SectionPage` (cada page).
// Ya no se usa el `InvestigacionNav` hardcoded; quedaba duplicado con el navbar.

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>;
}
