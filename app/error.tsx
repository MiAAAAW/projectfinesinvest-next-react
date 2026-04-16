"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold mb-2">Algo salio mal</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Ocurrio un error inesperado. Por favor, intenta nuevamente.
      </p>
      <Button onClick={() => reset()}>Reintentar</Button>
    </div>
  );
}
