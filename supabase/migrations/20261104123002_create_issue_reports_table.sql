/*
# Create issue_reports table

1. New Tables
- `issue_reports`
  - `id` (uuid, primary key)
  - `submitted_at` (timestamptz, defaults to now())
  - `user_name` (text, not null) — the employee reporting the issue
  - `user_email` (text, not null) — their contact email
  - `pc_name` (text, not null) — the device name
  - `affected_service` (text, not null) — e.g. VPN, printing, email, Teams
  - `specific_issue` (text, not null) — description of the problem
  - `error_received` (boolean, not null, defaults false) — whether an error message appeared
  - `error_message` (text, nullable) — the error text or code
  - `error_details` (text, nullable) — optional context about what happened
  - `affected_software` (text, not null) — the application that isn't working
  - `attachments` (jsonb, defaults '[]') — array of {name, type, size, dataUrl} objects

2. Security
- Enable RLS on `issue_reports`.
- Grant CRUD to `anon` + `authenticated` (no sign-in required for this internal tool).
- Allow anon + authenticated full CRUD because the data is intentionally shared/public.

3. Indexes
- `idx_issue_reports_submitted_at` — for sorting/dashboard time queries
- `idx_issue_reports_affected_service` — for dashboard breakdowns
- `idx_issue_reports_affected_software` — for dashboard breakdowns
*/

CREATE TABLE IF NOT EXISTS issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  pc_name text NOT NULL,
  affected_service text NOT NULL,
  specific_issue text NOT NULL,
  error_received boolean NOT NULL DEFAULT false,
  error_message text,
  error_details text,
  affected_software text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON issue_reports TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_issue_reports" ON issue_reports;
CREATE POLICY "anon_select_issue_reports" ON issue_reports
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_issue_reports" ON issue_reports;
CREATE POLICY "anon_insert_issue_reports" ON issue_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_issue_reports" ON issue_reports;
CREATE POLICY "anon_update_issue_reports" ON issue_reports
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_issue_reports" ON issue_reports;
CREATE POLICY "anon_delete_issue_reports" ON issue_reports
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_issue_reports_submitted_at ON issue_reports (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_reports_affected_service ON issue_reports (affected_service);
CREATE INDEX IF NOT EXISTS idx_issue_reports_affected_software ON issue_reports (affected_software);
