import type { Metadata } from "next";
import { AuthLayout } from "@/shared/layouts";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign In"
      description="Enter your credentials to access the dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
}
