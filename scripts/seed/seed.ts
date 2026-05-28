import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("Starting seed...\n");

  // Clean existing data (order matters for FK constraints)
  const tables = [
    "activity_timeline", "audit_logs",
    "violation_logs", "attendance_snapshots", "attendance_journal",
    "gate_logs", "payments", "payment_allocations", "invoice_items", "invoices",
    "charges", "allocations", "beds",
    "rooms", "floors", "properties",
    "emergency_contacts", "resident_documents",
    "user_roles", "role_permissions",
    "residents", "organizations",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error && error.code !== "42P01") console.error(`  Failed to clear ${table}:`, error.message);
  }
  console.log("  Cleared existing data\n");

  // 1. Organizations
  const orgs = [
    { id: crypto.randomUUID(), name: "Sunrise PG & Hostel" },
    { id: crypto.randomUUID(), name: "Green Valley Residency" },
    { id: crypto.randomUUID(), name: "Lake View Hostels" },
  ];

  for (const org of orgs) {
    const { error } = await supabase.from("organizations").upsert(org);
    if (error) console.error(`  Failed to insert org ${org.name}:`, error.message);
  }
  console.log(`  Created ${orgs.length} organizations`);

  // 2. Properties
  const properties = [
    { id: crypto.randomUUID(), organization_id: orgs[0].id, name: "Sunrise Main Branch", address: "123 MG Road, Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
    { id: crypto.randomUUID(), organization_id: orgs[0].id, name: "Sunrise Executive", address: "456 Brigade Road, Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
    { id: crypto.randomUUID(), organization_id: orgs[1].id, name: "Green Valley PG", address: "789 Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
    { id: crypto.randomUUID(), organization_id: orgs[1].id, name: "Green Valley Dormitory", address: "321 Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
    { id: crypto.randomUUID(), organization_id: orgs[2].id, name: "Lake View Residency", address: "654 Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
  ];

  for (const prop of properties) {
    const { error } = await supabase.from("properties").upsert(prop);
    if (error) console.error(`  Failed to insert property ${prop.name}:`, error.message);
  }
  console.log(`  Created ${properties.length} properties`);

  // 3. Floors
  const floors: { id: string; property_id: string; floor_number: number; name: string }[] = [];
  for (const prop of properties) {
    for (let i = 1; i <= 4; i++) {
      floors.push({
        id: crypto.randomUUID(),
        property_id: prop.id,
        floor_number: i,
        name: `Floor ${i}`,
      });
    }
  }

  for (const floor of floors) {
    const { error } = await supabase.from("floors").upsert(floor);
    if (error) console.error(`  Failed to insert floor ${floor.name}:`, error.message);
  }
  console.log(`  Created ${floors.length} floors`);

  // 4. Rooms
  const roomTypes = ["single", "double", "triple", "dormitory"];
  const baseRents = [8000, 6000, 4500, 3500];
  const rooms: { id: string; property_id: string; floor_id: string; organization_id: string; room_number: string; type: string; capacity: number; rent_amount: number; is_active: boolean }[] = [];

  for (const prop of properties) {
    const propFloors = floors.filter((f) => f.property_id === prop.id);
    const orgId = prop.organization_id!;

    for (const floor of propFloors) {
      for (let i = 1; i <= 5; i++) {
        const typeIdx = Math.floor(Math.random() * roomTypes.length);
        rooms.push({
          id: crypto.randomUUID(),
          property_id: prop.id,
          floor_id: floor.id,
          organization_id: orgId,
          room_number: `${floor.floor_number}${String(i).padStart(2, "0")}`,
          type: roomTypes[typeIdx]!,
          capacity: typeIdx + 1,
          rent_amount: baseRents[typeIdx]! + Math.floor(Math.random() * 2000),
          is_active: true,
        });
      }
    }
  }

  for (let i = 0; i < rooms.length; i += 10) {
    const batch = rooms.slice(i, i + 10);
    const { error } = await supabase.from("rooms").upsert(batch);
    if (error) console.error(`  Failed to insert rooms batch:`, error.message);
  }
  console.log(`  Created ${rooms.length} rooms`);

  // 5. Beds
  const beds: { id: string; room_id: string; bed_number: string; status: string }[] = [];
  for (const room of rooms) {
    for (let i = 1; i <= (room.capacity > 4 ? 4 : room.capacity); i++) {
      beds.push({
        id: crypto.randomUUID(),
        room_id: room.id,
        bed_number: `Bed ${String.fromCharCode(64 + i)}`,
        status: Math.random() > 0.3 ? "available" : "occupied",
      });
    }
  }

  for (let i = 0; i < beds.length; i += 20) {
    const batch = beds.slice(i, i + 20);
    const { error } = await supabase.from("beds").upsert(batch);
    if (error) console.error(`  Failed to insert beds batch:`, error.message);
  }
  console.log(`  Created ${beds.length} beds`);

  // 6. Residents
  const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Ananya", "Aadhya", "Ishita", "Anaya"];
  const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Reddy", "Gupta", "Joshi", "Nair", "Menon"];
  const occupations = ["Software Engineer", "Data Analyst", "Product Manager", "MBA Student", "Medical Student", "Research Scholar"];

  const occupiedBeds = beds.filter((b) => b.status === "occupied");
  const residents: { id: string; organization_id: string; name: string; email: string; phone: string; occupation: string; type: string; status: string; joining_date: string }[] = [];

  for (let i = 0; i < Math.min(occupiedBeds.length, 25); i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!;
    const org = orgs[Math.floor(Math.random() * orgs.length)]!;

    residents.push({
      id: crypto.randomUUID(),
      organization_id: org.id,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
      phone: `+91${String(9000000000 + Math.floor(Math.random() * 100000000)).slice(0, 10)}`,
      occupation: occupations[Math.floor(Math.random() * occupations.length)]!,
      type: Math.random() > 0.5 ? "pg" : "hostel",
      status: "active",
      joining_date: new Date(2025, 5 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 28)).toISOString().split("T")[0],
    });
  }

  for (let i = 0; i < residents.length; i += 5) {
    const batch = residents.slice(i, i + 5);
    const { error } = await supabase.from("residents").upsert(batch, { onConflict: "email" });
    if (error) console.error(`  Failed to insert residents batch:`, error.message);
  }
  console.log(`  Created ${residents.length} residents`);

  // 7. Allocations
  const allocations: { id: string; resident_id: string; bed_id: string; room_id: string; check_in_date: string; check_out_date: string | null; rent_amount: number; security_deposit: number; is_active: boolean }[] = [];

  for (let i = 0; i < Math.min(residents.length, occupiedBeds.length); i++) {
    const bed = occupiedBeds[i]!;
    const room = rooms.find((r) => r.id === bed.room_id);
    if (!room) continue;

    allocations.push({
      id: crypto.randomUUID(),
      resident_id: residents[i]!.id,
      bed_id: bed.id,
      room_id: room.id,
      check_in_date: new Date(2025, 5 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 28)).toISOString().split("T")[0],
      check_out_date: Math.random() > 0.8 ? new Date(2026, 11, 31).toISOString().split("T")[0] : null,
      rent_amount: room.rent_amount,
      security_deposit: 5000,
      is_active: Math.random() > 0.15,
    });
  }

  for (const alloc of allocations) {
    const { error } = await supabase.from("allocations").upsert(alloc);
    if (error) console.error(`  Failed to insert allocation:`, error.message);
  }
  console.log(`  Created ${allocations.length} allocations`);

  // 8. Invoices
  const invoiceStatuses = ["paid", "pending", "overdue", "cancelled"];
  const invoices: { id: string; resident_id: string; organization_id: string; allocation_id: string; invoice_number: string; total_amount: number; due_date: string; period_start: string; period_end: string; status: string; subtotal: number; paid_amount: number; balance: number }[] = [];

  for (const resident of residents.slice(0, 20)) {
    const alloc = allocations.find((a) => a.resident_id === resident.id);
    const numInvoices = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numInvoices; j++) {
      const dueDate = new Date(2025, 8 + j, 5);
      const totalAmt = 5000 + Math.floor(Math.random() * 15000);
      const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)]!;
      invoices.push({
        id: crypto.randomUUID(),
        resident_id: resident.id,
        organization_id: resident.organization_id,
        allocation_id: alloc?.id,
        invoice_number: `INV-2025-${String(invoices.length + 1).padStart(5, "0")}`,
        total_amount: totalAmt,
        subtotal: totalAmt,
        paid_amount: status === "paid" ? totalAmt : status === "pending" || status === "overdue" ? 0 : 0,
        balance: status === "paid" ? 0 : totalAmt,
        due_date: dueDate.toISOString().split("T")[0],
        period_start: new Date(2025, 7 + j, 1).toISOString().split("T")[0],
        period_end: new Date(2025, 8 + j, 0).toISOString().split("T")[0],
        status,
      });
    }
  }

  for (let i = 0; i < invoices.length; i += 10) {
    const batch = invoices.slice(i, i + 10);
    const { error } = await supabase.from("invoices").upsert(batch);
    if (error) console.error(`  Failed to insert invoices batch:`, error.message);
  }
  console.log(`  Created ${invoices.length} invoices`);

  // 9. Payments
  const paymentMethods = ["cash", "upi", "card", "bank_transfer"];
  const payments: { id: string; resident_id: string; organization_id: string; amount: number; payment_date: string; payment_method_id: string; reference_number: string; notes: string }[] = [];

  // Get payment method IDs
  const { data: pmData } = await supabase.from("payment_methods").select("id, code");
  const pmMap = new Map((pmData ?? []).map((p: any) => [p.code as string, p.id as string]));

  const paidInvoices = invoices.filter((i) => i.status === "paid" || i.status === "pending");
  for (const invoice of paidInvoices.slice(0, Math.floor(paidInvoices.length * 0.7))) {
    const paymentDate = new Date(new Date(invoice.due_date).getTime() - Math.floor(Math.random() * 5 * 86400000));
    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]!;
    payments.push({
      id: crypto.randomUUID(),
      resident_id: invoice.resident_id,
      organization_id: invoice.organization_id,
      amount: invoice.total_amount,
      payment_date: paymentDate.toISOString().split("T")[0],
      payment_method_id: pmMap.get(method) ?? pmMap.get("cash")!,
      reference_number: `TXN${String(Math.floor(Math.random() * 10000000)).padStart(8, "0")}`,
      notes: `Payment for invoice ${invoice.invoice_number}`,
    });
  }

  for (let i = 0; i < payments.length; i += 10) {
    const batch = payments.slice(i, i + 10);
    const { error } = await supabase.from("payments").upsert(batch);
    if (error) console.error(`  Failed to insert payments batch:`, error.message);
  }
  console.log(`  Created ${payments.length} payments`);

  // 10. Gate Logs
  const gateLogs: { id: string; resident_id: string; organization_id: string; entry_type: string; timestamp: string; method: string; verified_by_name: string | null }[] = [];

  for (const resident of residents.slice(0, 15)) {
    const numLogs = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numLogs; i++) {
      const hours = 8 + Math.floor(Math.random() * 12);
      const day = new Date(2025, 5 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 28));
      day.setHours(hours, Math.floor(Math.random() * 60));
      const isEntry = Math.random() > 0.5;
      gateLogs.push({
        id: crypto.randomUUID(),
        resident_id: resident.id,
        organization_id: resident.organization_id,
        entry_type: isEntry ? "entry" : "exit",
        timestamp: day.toISOString(),
        method: "manual",
        verified_by_name: Math.random() > 0.7 ? "Ramesh (Security)" : null,
      });
    }
  }

  for (let i = 0; i < gateLogs.length; i += 20) {
    const batch = gateLogs.slice(i, i + 20);
    const { error } = await supabase.from("gate_logs").upsert(batch);
    if (error) console.error(`  Failed to insert gate_logs batch:`, error.message);
  }
  console.log(`  Created ${gateLogs.length} gate logs`);

  // 11. Violations
  const vTypes = ["late_entry", "curfew_breach", "missing_checkout", "unauthorized_access"];
  const severities = ["low", "medium", "high"];

  const violations: { id: string; resident_id: string; organization_id: string; violation_type: string; severity: string; description: string; detected_at: string; resolved: boolean; resolved_at: string | null; notes: string | null }[] = [];

  for (const resident of residents.slice(0, 10)) {
    if (Math.random() > 0.6) {
      const vType = vTypes[Math.floor(Math.random() * vTypes.length)]!;
      const createdAt = new Date(2025, 5 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 28));
      const isResolved = Math.random() > 0.4;
      violations.push({
        id: crypto.randomUUID(),
        resident_id: resident.id,
        organization_id: resident.organization_id,
        violation_type: vType,
        severity: severities[Math.floor(Math.random() * severities.length)]!,
        description: vType.replace(/_/g, " "),
        detected_at: createdAt.toISOString(),
        resolved: isResolved,
        resolved_at: isResolved ? new Date(createdAt.getTime() + Math.floor(Math.random() * 7 * 86400000)).toISOString() : null,
        notes: isResolved ? "Issue resolved after discussion" : null,
      });
    }
  }

  for (let i = 0; i < violations.length; i += 10) {
    const batch = violations.slice(i, i + 10);
    const { error } = await supabase.from("violation_logs").upsert(batch);
    if (error) console.error(`  Failed to insert violations batch:`, error.message);
  }
  console.log(`  Created ${violations.length} violations`);

  console.log(`\nSeed complete! Created:`);
  console.log(`   - ${orgs.length} organizations`);
  console.log(`   - ${properties.length} properties`);
  console.log(`   - ${floors.length} floors`);
  console.log(`   - ${rooms.length} rooms`);
  console.log(`   - ${beds.length} beds`);
  console.log(`   - ${residents.length} residents`);
  console.log(`   - ${allocations.length} allocations`);
  console.log(`   - ${invoices.length} invoices`);
  console.log(`   - ${payments.length} payments`);
  console.log(`   - ${gateLogs.length} gate logs`);
  console.log(`   - ${violations.length} violations`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
