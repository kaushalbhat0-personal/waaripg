"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/shared/forms";
import { loginSchema, type LoginInput } from "../schemas";
import { login } from "../actions";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    setErrorCode(null);
    const result = await login(data);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error.message);
      setErrorCode(result.error.code ?? null);
    }
  }

  const isNotConfigured = errorCode === "ACCOUNT_NOT_CONFIGURED";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && !isNotConfigured && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {error && isNotConfigured && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/50">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Account Not Configured
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                {error}
              </p>
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Contact your system administrator to assign a role to your
                account.
              </p>
            </div>
          </div>
        </div>
      )}
      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          placeholder="admin@example.com"
          autoComplete="email"
          {...register("email")}
        />
      </FormField>
      <FormField label="Password" error={errors.password} required>
        <Input
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}
