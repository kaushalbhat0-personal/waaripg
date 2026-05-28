"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/shared/forms";
import { registerSchema, type RegisterInput } from "../schemas";
import { register as registerAction } from "../actions";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setError(null);
    const result = await registerAction(data);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <FormField label="Name" error={errors.name} required>
        <Input
          placeholder="Your full name"
          autoComplete="name"
          {...register("name")}
        />
      </FormField>
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
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          {...register("password")}
        />
      </FormField>
      <FormField label="Confirm Password" error={errors.confirmPassword} required>
        <Input
          type="password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
