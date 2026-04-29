import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ROUTES } from "@/constants";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) redirect(ROUTES.LOGIN);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">
          Halo, <span className="font-medium text-black">{user.email}</span>!
        </p>
      </div>
    </DashboardLayout>
  );
}
