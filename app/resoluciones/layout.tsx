import PublicPageLayout from "@/components/layout/PublicPageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>;
}
