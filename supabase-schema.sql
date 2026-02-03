-- =============================================================================
-- ELIXUS PORTAL DATABASE SCHEMA
-- =============================================================================
-- IMPORTANT: This is for the shared Supabase project with Elixus OS.
-- All tables are prefixed with "portal_" to keep them separate.
-- DO NOT modify any non-portal tables!
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: portal_clients
-- Primary table for portal users. Uses auth.users.id as the primary key (1:1).
-- -----------------------------------------------------------------------------
CREATE TABLE portal_clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  user_type TEXT NOT NULL DEFAULT 'portal_client',
  ghl_location_id TEXT, -- For future GHL integration
  onboarding_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (onboarding_status IN ('in_progress', 'complete')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_portal_clients_email ON portal_clients(email);

-- -----------------------------------------------------------------------------
-- TABLE: portal_a2p_submissions
-- A2P 10DLC registration submissions. One per client.
-- -----------------------------------------------------------------------------
CREATE TABLE portal_a2p_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES portal_clients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'action_required', 'processing', 'approved', 'rejected')),

  -- Business Information
  legal_business_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  business_phone TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_website TEXT,

  -- Authorized Representative
  rep_first_name TEXT NOT NULL,
  rep_last_name TEXT NOT NULL,
  rep_email TEXT NOT NULL,
  rep_job_title TEXT NOT NULL,
  rep_phone TEXT NOT NULL,

  -- Business Classification
  business_type TEXT NOT NULL, -- Legal entity type (LLC, Corporation, etc.)
  business_industry TEXT NOT NULL,
  tax_id TEXT NOT NULL, -- EIN/Tax ID

  -- Compliance Assets
  privacy_policy_url TEXT,
  terms_url TEXT,
  opt_in_url TEXT,

  -- Admin fields
  admin_notes TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for client lookups
CREATE INDEX idx_portal_a2p_submissions_client_id ON portal_a2p_submissions(client_id);
CREATE INDEX idx_portal_a2p_submissions_status ON portal_a2p_submissions(status);

-- -----------------------------------------------------------------------------
-- TABLE: portal_activity
-- Activity log for client actions.
-- -----------------------------------------------------------------------------
CREATE TABLE portal_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for client activity lookups
CREATE INDEX idx_portal_activity_client_id ON portal_activity(client_id);
CREATE INDEX idx_portal_activity_created_at ON portal_activity(created_at DESC);

-- -----------------------------------------------------------------------------
-- TABLE: portal_system_status
-- System integration status for each client.
-- -----------------------------------------------------------------------------
CREATE TABLE portal_system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES portal_clients(id) ON DELETE CASCADE,
  crm_integration TEXT NOT NULL DEFAULT 'pending' CHECK (crm_integration IN ('pending', 'in_progress', 'connected')),
  sms_registration TEXT NOT NULL DEFAULT 'pending' CHECK (sms_registration IN ('pending', 'in_progress', 'approved', 'rejected')),
  workflow_automation TEXT NOT NULL DEFAULT 'pending' CHECK (workflow_automation IN ('pending', 'in_progress', 'active')),
  calendar_sync TEXT NOT NULL DEFAULT 'pending' CHECK (calendar_sync IN ('pending', 'in_progress', 'connected')),
  estimated_go_live DATE,
  current_phase INTEGER NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for client lookups
CREATE INDEX idx_portal_system_status_client_id ON portal_system_status(client_id);

-- -----------------------------------------------------------------------------
-- TRIGGERS: Auto-update updated_at timestamps
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portal_clients_updated_at
  BEFORE UPDATE ON portal_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_a2p_submissions_updated_at
  BEFORE UPDATE ON portal_a2p_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_system_status_updated_at
  BEFORE UPDATE ON portal_system_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all portal tables
ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_a2p_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_system_status ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- portal_clients policies
-- Users can only access their own client record
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own client record"
  ON portal_clients
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own client record"
  ON portal_clients
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert policy: Users can create their own record during signup
-- The id must match their auth.uid()
CREATE POLICY "Users can insert their own client record"
  ON portal_clients
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- portal_a2p_submissions policies
-- Users can only access submissions where they are the client
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own A2P submission"
  ON portal_a2p_submissions
  FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert their own A2P submission"
  ON portal_a2p_submissions
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update their own A2P submission"
  ON portal_a2p_submissions
  FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- -----------------------------------------------------------------------------
-- portal_activity policies
-- Users can only view their own activity (read-only for users)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own activity"
  ON portal_activity
  FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert activity for themselves (for client-side logging)
CREATE POLICY "Users can insert their own activity"
  ON portal_activity
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- -----------------------------------------------------------------------------
-- portal_system_status policies
-- Users can only view their own system status (read-only for users)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own system status"
  ON portal_system_status
  FOR SELECT
  USING (client_id = auth.uid());

-- =============================================================================
-- SERVICE ROLE POLICIES (for admin operations)
-- =============================================================================
-- Note: The service_role key bypasses RLS entirely, so admins using the
-- service key can perform any operation on these tables.
-- If you need more granular admin access via anon key, add policies like:
--
-- CREATE POLICY "Admins can do everything on portal_clients"
--   ON portal_clients
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM your_admin_table WHERE user_id = auth.uid()
--     )
--   );

-- =============================================================================
-- OPTIONAL: Function to create client record on signup
-- =============================================================================
-- You can use this with a database trigger on auth.users, or call it manually
-- from your application after signup.

CREATE OR REPLACE FUNCTION handle_new_portal_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create portal_client if the user signed up through the portal
  -- You might want to check metadata or another flag here
  INSERT INTO portal_clients (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Also create their initial system status record
  INSERT INTO portal_system_status (client_id)
  VALUES (NEW.id);

  -- Log the signup activity
  INSERT INTO portal_activity (client_id, action, details)
  VALUES (NEW.id, 'account_created', 'Portal account created');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OPTIONAL: Uncomment if you want automatic client creation on signup
-- Note: This will create a portal_client for EVERY auth.users signup,
-- which may not be what you want if Elixus OS also uses this auth.
-- Better to handle this in your application code.
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_portal_user();
