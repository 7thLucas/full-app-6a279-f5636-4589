import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest, signJwt, buildAuthCookie } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { RegisterCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/admin");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.register({
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const token = signJwt({ sub: user.id, role: user.role, username: user.username, email: user.email });
    return redirect("/admin", { headers: { "Set-Cookie": buildAuthCookie(token, new URL(request.url).hostname) } });
  } catch (error: any) {
    return { error: error.message ?? "Registration failed" };
  }
}

export default function RegisterRoute() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">EO</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">EscapeOps</h1>
          <p className="text-sm text-slate-400 mt-1">Create your operator account</p>
        </div>
        <RegisterCard />
      </div>
    </div>
  );
}
