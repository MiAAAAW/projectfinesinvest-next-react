import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sprout, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Grupos de Investigación",
    description: "Grupos de investigación registrados en la facultad",
    href: "/investigacion/grupos",
    icon: Users,
  },
  {
    title: "Semilleros de Investigación",
    description: "Semilleros de investigación activos",
    href: "/investigacion/semilleros",
    icon: Sprout,
  },
  {
    title: "Publicaciones",
    description: "Artículos, libros y producción científica",
    href: "/investigacion/publicaciones",
    icon: BookOpen,
  },
  {
    title: "Docentes",
    description: "Plana docente FINESI — con filtro RENACYT integrado",
    href: "/investigacion/docentes",
    icon: GraduationCap,
  },
  {
    title: "Ética en Investigación",
    description: "Comité de ética y normativas",
    href: "/investigacion/etica",
    icon: ShieldCheck,
  },
];

export default function InvestigacionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Investigación</h1>
      <p className="text-muted-foreground mb-8">
        Conoce las actividades de investigación de la facultad
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:bg-muted/50 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
