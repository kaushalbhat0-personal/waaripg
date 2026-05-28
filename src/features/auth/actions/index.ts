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
