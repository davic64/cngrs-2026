import { getUsers } from "@/app/actions/admin";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return <AdminUsersClient initialUsers={users} />;
}
