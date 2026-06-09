import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AdminLayout } from "~/components/admin/admin-layout";
import { DashboardOverview } from "~/escapeops/dashboard/components/dashboard-overview";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <DashboardOverview />
    </AdminLayout>
  );
}
