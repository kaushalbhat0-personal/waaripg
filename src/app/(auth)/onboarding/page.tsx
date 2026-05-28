"use client";

import { useRouter } from "next/navigation";
import { AuthLayout } from "@/shared/layouts";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Account Not Configured"
      description="Your account has not been assigned a role yet"
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
            <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            You are successfully authenticated, but your account has not been
            configured with the necessary permissions to access the dashboard.
          </p>
          <div className="rounded-md bg-muted p-4 text-left text-sm">
            <p className="font-medium">What to do next:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Contact your system administrator</li>
              <li>Ask them to assign an appropriate role to your account</li>
              <li>Once assigned, log out and log back in</li>
            </ul>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  );
}
