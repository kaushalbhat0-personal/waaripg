-- Create enums
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE charge_category AS ENUM ('rent', 'electricity', 'water', 'maintenance', 'fine', 'deposit', 'discount', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE charge_recurrence AS ENUM ('monthly', 'one-time', 'quarterly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sequences for human-readable numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

-- Payment methods reference table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed payment methods
INSERT INTO payment_methods (code, name) VALUES
  ('cash', 'Cash'),
  ('upi', 'UPI'),
  ('bank_transfer', 'Bank Transfer'),
  ('card', 'Card'),
  ('cheque', 'Cheque')
ON CONFLICT (code) DO NOTHING;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  allocation_id UUID REFERENCES allocations(id),
  invoice_number TEXT NOT NULL UNIQUE,
  status invoice_status NOT NULL DEFAULT 'draft',
  due_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_reason TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Invoice items (line items)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  charge_id UUID REFERENCES charges(id),
  category charge_category NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charges (reusable recurring/one-time charge templates)
CREATE TABLE IF NOT EXISTS charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id),
  allocation_id UUID REFERENCES allocations(id),
  category charge_category NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  recurrence charge_recurrence NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Payments (immutable — insert only, no updates, no hard deletes)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  reference_number TEXT,
  receipt_number TEXT UNIQUE,
  notes TEXT,
  is_refund BOOLEAN NOT NULL DEFAULT false,
  refunds_payment_id UUID REFERENCES payments(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment allocations (maps payments to invoices)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(payment_id, invoice_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_resident ON invoices(resident_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_active ON invoices(created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_category ON invoice_items(category);

CREATE INDEX IF NOT EXISTS idx_payments_resident ON payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payments_refund ON payments(refunds_payment_id) WHERE is_refund = true;

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_invoice ON payment_allocations(invoice_id);

CREATE INDEX IF NOT EXISTS idx_charges_resident ON charges(resident_id);
CREATE INDEX IF NOT EXISTS idx_charges_category ON charges(category);
CREATE INDEX IF NOT EXISTS idx_charges_active ON charges(is_active) WHERE deleted_at IS NULL;

-- Auto-update triggers
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_charges_updated_at
  BEFORE UPDATE ON charges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_val BIGINT;
  year_str TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  next_val := NEXTVAL('invoice_number_seq');
  RETURN 'INV-' || year_str || '-' || LPAD(next_val::TEXT, 5, '0');
END;
$$;

-- Function to auto-generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_val BIGINT;
  year_str TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  next_val := NEXTVAL('receipt_number_seq');
  RETURN 'RCPT-' || year_str || '-' || LPAD(next_val::TEXT, 5, '0');
END;
$$;

-- Function to refresh invoice status based on payments
CREATE OR REPLACE FUNCTION refresh_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  inv_total DECIMAL(12,2);
  inv_paid DECIMAL(12,2);
  inv_due_date DATE;
BEGIN
  SELECT total_amount, due_date INTO inv_total, inv_due_date
  FROM invoices WHERE id = NEW.invoice_id;

  SELECT COALESCE(SUM(amount), 0) INTO inv_paid
  FROM payment_allocations WHERE invoice_id = NEW.invoice_id;

  IF inv_paid >= inv_total THEN
    UPDATE invoices SET
      paid_amount = inv_paid,
      balance = 0,
      status = 'paid',
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
  ELSIF inv_paid > 0 THEN
    UPDATE invoices SET
      paid_amount = inv_paid,
      balance = inv_total - inv_paid,
      status = CASE WHEN NOW()::DATE > inv_due_date THEN 'overdue' ELSE 'partial' END,
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER refresh_invoice_status_on_alloc
  AFTER INSERT OR DELETE ON payment_allocations
  FOR EACH ROW EXECUTE FUNCTION refresh_invoice_status();
