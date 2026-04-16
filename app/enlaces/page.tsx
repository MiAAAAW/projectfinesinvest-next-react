import { prisma, notDeleted } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function EnlacesPage() {
  const links = await prisma.externalLink.findMany({
    where: { ...notDeleted, published: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  // Group links by category
  const grouped = links.reduce<Record<string, typeof links>>((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inicio
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Enlaces de Interes</h1>
      <p className="text-muted-foreground mb-8">
        Enlaces a recursos y sitios web relevantes
      </p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No hay enlaces disponibles.
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categoryLinks]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full transition-colors hover:bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          {link.title}
                          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardTitle>
                      </CardHeader>
                      {link.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
