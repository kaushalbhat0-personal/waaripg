"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "../schemas";
import type { ActionResponse } from "@/types";

export async function login(input: LoginInput): Promise<ActionResponse> {
  const validated = loginSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return {
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: error.message,
      },
    };
  }

  // After successful auth, check role assignment and bootstrap if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { hasRole, assignUserRole } = await import("@/services/rbac");
    const hasExistingRole = await hasRole(user.id);

    if (!hasExistingRole) {
      // Attempt bootstrap: if no admins exist, this user becomes admin
      const bootstrapResult = await assignUserRole({
        user_id: user.id,
        role_name: "admin",
        bootstrap: true,
      });

      if (!bootstrapResult.success) {
        // Bootstrap failed — existing admin exists, user needs manual setup
        return {
          success: false,
          error: {
            code: "ACCOUNT_NOT_CONFIGURED",
            message:
              "Your account has been authenticated but has not been assigned a role yet. Please contact your system administrator to get access.",
          },
        };
      }

      if (bootstrapResult.data?.bootstrapped) {
        console.log(
          `[BOOTSTRAP] First admin auto-created for user ${user.id} (${user.email})`,
        );
      }
    }
  }

  return { success: true, data: undefined };
}

export async function register(input: RegisterInput): Promise<ActionResponse> {
  const validated = registerSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        name: validated.data.name,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: error.message,
      },
    };
  }

  return { success: true, data: undefined };
}

export async function logout(): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: error.message,
      },
    };
  }

  return { success: true, data: undefined };
}
