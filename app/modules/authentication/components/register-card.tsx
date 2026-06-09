import { useEffect, useState } from "react";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Eye, EyeOff, Briefcase, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useToast } from "~/components/ui/toast";

interface ActionData {
  error?: string;
}

export function RegisterCard() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [role, setRole] = useState<"agency" | "client">("agency");
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (actionData?.error) toast(actionData.error, "error");
  }, [actionData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create account</CardTitle>
          <CardDescription>Fill in the details below to get started</CardDescription>
        </CardHeader>

        <Form method="post">
          <CardContent className="space-y-4">
            {/* Role selector */}
            <div className="space-y-2">
              <Label>I am a…</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("agency")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 text-sm transition-colors",
                    role === "agency"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">Agency</span>
                  <span className="text-xs">Upload & manage reviews</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 text-sm transition-colors",
                    role === "client"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Client</span>
                  <span className="text-xs">Review & approve files</span>
                </button>
              </div>
              <input type="hidden" name="role" value={role} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
