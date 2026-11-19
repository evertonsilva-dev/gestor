CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE app_role AS ENUM ('admin', 'client');
CREATE TYPE period_status AS ENUM ('processing', 'published');
CREATE TYPE news_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE audience_profile AS ENUM ('militante', 'simpatizante', 'detrator');
CREATE TYPE recommendation_category AS ENUM ('insight', 'action', 'example');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_users (
  auth_user_id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  role app_role NOT NULL,
  organization_id uuid REFERENCES organizations(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (role = 'admin' AND organization_id IS NULL)
    OR (role = 'client' AND organization_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX one_global_admin ON app_users ((role)) WHERE role = 'admin';

CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name),
  UNIQUE (id, organization_id)
);

CREATE TABLE monitored_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TABLE monitoring_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status period_status NOT NULL DEFAULT 'processing',
  created_by text NOT NULL REFERENCES app_users(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CHECK (end_date >= start_date),
  CHECK ((status = 'processing' AND published_at IS NULL) OR (status = 'published' AND published_at IS NOT NULL)),
  UNIQUE (organization_id, start_date, end_date),
  UNIQUE (id, organization_id)
);

CREATE TABLE news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  period_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  title text NOT NULL,
  source_url text,
  published_at timestamptz NOT NULL,
  sentiment news_sentiment NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (period_id, organization_id) REFERENCES monitoring_periods(id, organization_id),
  FOREIGN KEY (channel_id, organization_id) REFERENCES channels(id, organization_id)
);

CREATE TABLE analyzed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  period_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  content text NOT NULL,
  commented_at timestamptz NOT NULL,
  profile audience_profile NOT NULL,
  sentiment news_sentiment NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (period_id, organization_id) REFERENCES monitoring_periods(id, organization_id),
  FOREIGN KEY (channel_id, organization_id) REFERENCES channels(id, organization_id)
);

CREATE TABLE recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  period_id uuid NOT NULL,
  category recommendation_category NOT NULL,
  content text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (period_id, organization_id) REFERENCES monitoring_periods(id, organization_id)
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id text NOT NULL REFERENCES app_users(auth_user_id),
  organization_id uuid REFERENCES organizations(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX monitoring_periods_org_status_dates_idx
  ON monitoring_periods (organization_id, status, end_date DESC);
CREATE INDEX news_items_period_idx ON news_items (period_id, published_at DESC);
CREATE INDEX analyzed_comments_period_idx ON analyzed_comments (period_id, commented_at DESC);
CREATE INDEX recommendations_period_idx ON recommendations (period_id, sort_order, created_at);
CREATE INDEX audit_events_org_created_idx ON audit_events (organization_id, created_at DESC);

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE FUNCTION current_app_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role::text
  FROM app_users
  WHERE auth_user_id = current_setting('app.user_id', true)
    AND active = true
  LIMIT 1
$$;

CREATE FUNCTION current_app_organization_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT organization_id
  FROM app_users
  WHERE auth_user_id = current_setting('app.user_id', true)
    AND active = true
  LIMIT 1
$$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY organizations_read ON organizations
  FOR SELECT
  USING (current_app_role() = 'admin' OR id = current_app_organization_id());
CREATE POLICY organizations_admin_manage ON organizations
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels FORCE ROW LEVEL SECURITY;
CREATE POLICY channels_read ON channels
  FOR SELECT
  USING (current_app_role() = 'admin' OR organization_id = current_app_organization_id());
CREATE POLICY channels_admin_manage ON channels
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE monitored_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_topics FORCE ROW LEVEL SECURITY;
CREATE POLICY topics_admin_manage ON monitored_topics
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE monitoring_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_periods FORCE ROW LEVEL SECURITY;
CREATE POLICY periods_read_published ON monitoring_periods
  FOR SELECT
  USING (
    current_app_role() = 'admin'
    OR (organization_id = current_app_organization_id() AND status = 'published')
  );
CREATE POLICY periods_admin_manage ON monitoring_periods
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items FORCE ROW LEVEL SECURITY;
CREATE POLICY news_read_published ON news_items
  FOR SELECT
  USING (
    current_app_role() = 'admin'
    OR (
      organization_id = current_app_organization_id()
      AND EXISTS (
        SELECT 1 FROM monitoring_periods p
        WHERE p.id = period_id AND p.status = 'published'
      )
    )
  );
CREATE POLICY news_admin_manage ON news_items
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE analyzed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_comments FORCE ROW LEVEL SECURITY;
CREATE POLICY comments_read_published ON analyzed_comments
  FOR SELECT
  USING (
    current_app_role() = 'admin'
    OR (
      organization_id = current_app_organization_id()
      AND EXISTS (
        SELECT 1 FROM monitoring_periods p
        WHERE p.id = period_id AND p.status = 'published'
      )
    )
  );
CREATE POLICY comments_admin_manage ON analyzed_comments
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations FORCE ROW LEVEL SECURITY;
CREATE POLICY recommendations_read_published ON recommendations
  FOR SELECT
  USING (
    current_app_role() = 'admin'
    OR (
      organization_id = current_app_organization_id()
      AND EXISTS (
        SELECT 1 FROM monitoring_periods p
        WHERE p.id = period_id AND p.status = 'published'
      )
    )
  );
CREATE POLICY recommendations_admin_manage ON recommendations
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_events_admin_read ON audit_events
  FOR SELECT
  USING (current_app_role() = 'admin');
CREATE POLICY audit_events_admin_insert ON audit_events
  FOR INSERT
  WITH CHECK (current_app_role() = 'admin');

CREATE FUNCTION prevent_published_period_content_mutation() RETURNS trigger AS $$
DECLARE
  checked_period_id uuid;
  checked_status period_status;
BEGIN
  checked_period_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.period_id ELSE NEW.period_id END;
  SELECT status INTO checked_status FROM monitoring_periods WHERE id = checked_period_id;

  IF checked_status IS DISTINCT FROM 'processing' THEN
    RAISE EXCEPTION 'Content may only be changed while its period is processing';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_items_processing_only
  BEFORE INSERT OR UPDATE OR DELETE ON news_items
  FOR EACH ROW EXECUTE FUNCTION prevent_published_period_content_mutation();
CREATE TRIGGER analyzed_comments_processing_only
  BEFORE INSERT OR UPDATE OR DELETE ON analyzed_comments
  FOR EACH ROW EXECUTE FUNCTION prevent_published_period_content_mutation();
CREATE TRIGGER recommendations_processing_only
  BEFORE INSERT OR UPDATE OR DELETE ON recommendations
  FOR EACH ROW EXECUTE FUNCTION prevent_published_period_content_mutation();

CREATE FUNCTION prevent_published_period_change() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'published' THEN
    RAISE EXCEPTION 'Published periods are immutable';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monitoring_periods_immutable_after_publish
  BEFORE UPDATE OR DELETE ON monitoring_periods
  FOR EACH ROW EXECUTE FUNCTION prevent_published_period_change();
