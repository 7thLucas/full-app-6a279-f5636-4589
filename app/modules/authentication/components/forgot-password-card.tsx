import { useEffect } from "react";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/toast";

interface ActionData {
  success?: boolean;
  message?: string;
  error?: string;
}

export function ForgotPasswordCard() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const toast = useToast();

  useEffect(() => {
    if (actionData?.error) toast(actionData.error, "error");
    else if (actionData?.success && actionData.message) toast(actionData.message, "success");
  }, [actionData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link if an account exists
          </CardDescription>
        </CardHeader>

        <Form method="post">
          <CardContent className="space-y-4">

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
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
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
