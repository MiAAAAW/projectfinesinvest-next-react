import { NotFoundState } from "@/components/admin/NotFoundState";

export default function AdminNotFound() {
  return (
    <NotFoundState
      title="Pagina no encontrada"
      description="La pagina que buscas no existe en el panel de administracion."
      backHref="/admin"
      backLabel="Volver al panel"
    />
  );
}
