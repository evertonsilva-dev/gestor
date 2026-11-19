CREATE TABLE client_access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 2 AND 120),
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  created_by text NOT NULL REFERENCES app_users(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX client_access_keys_org_created_idx
  ON client_access_keys (organization_id, created_at DESC);

CREATE TABLE client_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id uuid NOT NULL REFERENCES client_access_keys(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX client_access_sessions_expiry_idx ON client_access_sessions (expires_at);

CREATE OR REPLACE FUNCTION current_app_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role::text
  FROM app_users
  WHERE auth_user_id = current_setting('app.user_id', true)
    AND active = true
  UNION ALL
  SELECT 'client'
  FROM client_access_keys k
  JOIN organizations o ON o.id = k.organization_id
  WHERE 'client:' || k.id::text = current_setting('app.user_id', true)
    AND k.revoked_at IS NULL
    AND o.active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION current_app_organization_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT organization_id
  FROM app_users
  WHERE auth_user_id = current_setting('app.user_id', true)
    AND active = true
  UNION ALL
  SELECT k.organization_id
  FROM client_access_keys k
  JOIN organizations o ON o.id = k.organization_id
  WHERE 'client:' || k.id::text = current_setting('app.user_id', true)
    AND k.revoked_at IS NULL
    AND o.active = true
  LIMIT 1
$$;

ALTER TABLE client_access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_access_keys FORCE ROW LEVEL SECURITY;
CREATE POLICY client_access_keys_admin_manage ON client_access_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      WHERE u.auth_user_id = current_setting('app.user_id', true)
        AND u.role = 'admin'
        AND u.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users u
      WHERE u.auth_user_id = current_setting('app.user_id', true)
        AND u.role = 'admin'
        AND u.active = true
    )
  );
CREATE POLICY client_access_keys_auth_lookup ON client_access_keys
  FOR SELECT
  USING (
    current_setting('app.auth_context', true) = 'client_auth'
    OR (
      id::text = substring(current_setting('app.user_id', true) FROM 8)
      AND revoked_at IS NULL
    )
  );

ALTER TABLE client_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_access_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY client_access_sessions_auth_read ON client_access_sessions
  FOR SELECT
  USING (current_setting('app.auth_context', true) = 'client_auth');
CREATE POLICY client_access_sessions_auth_create ON client_access_sessions
  FOR INSERT
  WITH CHECK (current_setting('app.auth_context', true) = 'client_auth');
CREATE POLICY client_access_sessions_auth_delete ON client_access_sessions
  FOR DELETE
  USING (current_setting('app.auth_context', true) = 'client_auth');
