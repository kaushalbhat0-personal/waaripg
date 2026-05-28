-- Create enums
DO $$ BEGIN
  CREATE TYPE resident_type AS ENUM ('pg', 'hostel');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE accommodation_status AS ENUM ('active', 'inactive', 'terminated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE id_proof_type AS ENUM ('aadhar', 'pan', 'voter_id', 'driving_license', 'passport', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create residents table
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  type resident_type NOT NULL DEFAULT 'pg',
  gender gender_type,
  date_of_birth DATE,
  joining_date DATE DEFAULT CURRENT_DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  id_proof_type id_proof_type,
  id_proof_number TEXT,
  occupation TEXT,
  institution_name TEXT,
  institution_address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  roll_number TEXT,
  course TEXT,
  year TEXT,
  curfew_time TIME,
  status accommodation_status NOT NULL DEFAULT 'active',
  notes TEXT,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resident_documents table
CREATE TABLE IF NOT EXISTS resident_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_name TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_residents_organization ON residents(organization_id);
CREATE INDEX IF NOT EXISTS idx_residents_type ON residents(type);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_residents_phone ON residents(phone);
CREATE INDEX IF NOT EXISTS idx_residents_email ON residents(email);
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_residents_deleted_at ON residents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_resident ON emergency_contacts(resident_id);
CREATE INDEX IF NOT EXISTS idx_resident_documents_resident ON resident_documents(resident_id);

-- Soft delete filter for common queries
CREATE INDEX IF NOT EXISTS idx_residents_active ON residents(id) WHERE deleted_at IS NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_residents_updated_at
  BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable trigram extension for fuzzy name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
