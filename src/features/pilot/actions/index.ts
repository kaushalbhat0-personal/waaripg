"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { PilotOrganization, ProvisioningResult, BootstrapConfig } from "../types";

export async function provisionOrganization(
  org: PilotOrganization,
): Promise<ProvisioningResult> {
  const errors: string[] = [];

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, errors: ["Not authenticated"] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: newOrg, error: orgError } = await s
      .from("organizations")
      .insert({ name: org.name })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      errors.push(orgError?.message ?? "Failed to create organization");
      return { success: false, errors };
    }

    const { error: propError } = await s
      .from("properties")
      .insert({
        organization_id: newOrg.id,
        name: `${org.name} Main`,
        address: "",
        city: "",
        state: "",
        is_active: true,
      });

    if (propError) errors.push(propError.message);

    logger.info("Organization provisioned", {
      organization_id: newOrg.id,
      name: org.name,
    });

    return {
      success: true,
      organization_id: newOrg.id,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provisioning failed";
    logger.error("Organization provisioning failed", err instanceof Error ? err : undefined);
    return { success: false, errors: [message] };
  }
}

export async function bootstrapOrganization(
  organizationId: string,
  config: BootstrapConfig,
): Promise<ProvisioningResult> {
  const errors: string[] = [];

  try {
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    if (config.sample_rooms > 0) {
      const rooms = [];
      for (let i = 1; i <= config.sample_rooms; i++) {
        rooms.push({
          property_id: null,
          organization_id: organizationId,
          room_number: String(i).padStart(3, "0"),
          type: i % 3 === 0 ? "single" : i % 3 === 1 ? "double" : "dormitory",
          capacity: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 4,
          rent_amount: 5000 + (i % 5) * 2000,
          is_active: true,
        });
      }
      const { error } = await s.from("rooms").insert(rooms);
      if (error) errors.push(`Room bootstrap: ${error.message}`);
    }

    logger.info("Organization bootstrapped", {
      organization_id: organizationId,
      config,
    });

    return { success: errors.length === 0, organization_id: organizationId, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bootstrap failed";
    logger.error("Organization bootstrap failed", err instanceof Error ? err : undefined);
    return { success: false, errors: [message] };
  }
}
