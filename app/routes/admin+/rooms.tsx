import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AdminLayout } from "~/components/admin/admin-layout";
import { RoomsManager } from "~/escapeops/rooms/components/rooms-manager";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function RoomsPage() {
  return (
    <AdminLayout title="Rooms">
      <RoomsManager />
    </AdminLayout>
  );
}
