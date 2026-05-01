import { getUsers } from "@/lib/actions/user";
import UserClientPage from "./user-client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const page = Number(params.page) || 1;

  const { data, totalPages } = await getUsers(q, page);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manajemen User</h2>
      <UserClientPage data={data} totalPages={totalPages} />
    </div>
  );
}
