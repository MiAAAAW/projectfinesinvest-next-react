import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold mb-2">Pagina no encontrada</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        La pagina que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
