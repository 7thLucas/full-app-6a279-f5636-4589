import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AdminLayout } from "~/components/admin/admin-layout";
import { PuzzleTracker } from "~/escapeops/puzzles/components/puzzle-tracker";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function PuzzlesPage() {
  return (
    <AdminLayout title="Puzzle Tracker">
      <PuzzleTracker />
    </AdminLayout>
  );
}
