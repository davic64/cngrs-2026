import { getSessionUser } from "@/app/actions/auth";

// Las Server Actions son endpoints públicos: toda acción administrativa debe
// llamar esto primero. Devuelve el admin en sesión o lanza.
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("No autorizado");
  }
  return user;
}
