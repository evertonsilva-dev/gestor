CREATE TABLE source_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  name text NOT NULL,
  url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (channel_id, organization_id) REFERENCES channels(id, organization_id),
  UNIQUE (id, organization_id),
  UNIQUE (id, channel_id, organization_id),
  UNIQUE (channel_id, name)
);

ALTER TABLE news_items
  ADD COLUMN source_page_id uuid,
  ADD COLUMN sentiment_source text NOT NULL DEFAULT 'manual'
    CHECK (sentiment_source IN ('ai', 'manual')),
  ADD COLUMN sentiment_reason text,
  ADD COLUMN sentiment_keywords text[] NOT NULL DEFAULT '{}',
  ADD CONSTRAINT news_items_source_page_scope_fk
    FOREIGN KEY (source_page_id, channel_id, organization_id)
    REFERENCES source_pages(id, channel_id, organization_id);

ALTER TABLE analyzed_comments
  ADD COLUMN source_page_id uuid,
  ADD COLUMN sentiment_source text NOT NULL DEFAULT 'manual'
    CHECK (sentiment_source IN ('ai', 'manual')),
  ADD COLUMN sentiment_reason text,
  ADD COLUMN sentiment_keywords text[] NOT NULL DEFAULT '{}',
  ADD CONSTRAINT analyzed_comments_source_page_scope_fk
    FOREIGN KEY (source_page_id, channel_id, organization_id)
    REFERENCES source_pages(id, channel_id, organization_id);

CREATE INDEX news_items_source_page_period_idx
  ON news_items (source_page_id, period_id)
  WHERE source_page_id IS NOT NULL;
CREATE INDEX analyzed_comments_source_page_period_idx
  ON analyzed_comments (source_page_id, period_id)
  WHERE source_page_id IS NOT NULL;

ALTER TABLE source_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_pages FORCE ROW LEVEL SECURITY;
CREATE POLICY source_pages_admin_manage ON source_pages
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');

CREATE TABLE source_page_period_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  period_id uuid NOT NULL,
  source_page_id uuid NOT NULL,
  suggested_affinity text NOT NULL
    CHECK (suggested_affinity IN ('allied', 'neutral', 'critical')),
  reviewed_affinity text NOT NULL
    CHECK (reviewed_affinity IN ('allied', 'neutral', 'critical')),
  reviewed_by text NOT NULL REFERENCES app_users(auth_user_id),
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (period_id, organization_id)
    REFERENCES monitoring_periods(id, organization_id),
  FOREIGN KEY (source_page_id, organization_id)
    REFERENCES source_pages(id, organization_id),
  UNIQUE (source_page_id, period_id)
);

CREATE INDEX source_page_period_reviews_period_idx
  ON source_page_period_reviews (period_id, source_page_id);

ALTER TABLE source_page_period_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_page_period_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY source_page_period_reviews_admin_manage
  ON source_page_period_reviews
  FOR ALL
  USING (current_app_role() = 'admin')
  WITH CHECK (current_app_role() = 'admin');
