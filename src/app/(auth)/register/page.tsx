import type { Metadata } from "next";
import { AuthLayout } from "@/shared/layouts";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      description="Register to get started"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
