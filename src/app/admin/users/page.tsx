import { getLocalities, getUsers } from "@/app/actions/admin";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, localities] = await Promise.all([getUsers(), getLocalities()]);

  return <AdminUsersClient initialUsers={users} localities={localities} />;
}
