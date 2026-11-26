ALTER TABLE news_items
  ALTER COLUMN published_at DROP NOT NULL;

ALTER TABLE analyzed_comments
  ALTER COLUMN commented_at DROP NOT NULL,
  ADD COLUMN news_item_id uuid REFERENCES news_items(id) ON DELETE SET NULL;

ALTER TABLE news_items
  ADD CONSTRAINT news_items_link_scope_unique
  UNIQUE (id, organization_id, period_id, channel_id);

ALTER TABLE analyzed_comments
  ADD CONSTRAINT analyzed_comments_news_scope_fk
  FOREIGN KEY (news_item_id, organization_id, period_id, channel_id)
  REFERENCES news_items (id, organization_id, period_id, channel_id);

CREATE INDEX analyzed_comments_news_item_idx
  ON analyzed_comments (news_item_id)
  WHERE news_item_id IS NOT NULL;

CREATE OR REPLACE FUNCTION prevent_published_period_content_mutation() RETURNS trigger AS $$
DECLARE
  checked_period_id uuid;
  checked_status period_status;
BEGIN
  checked_period_id := CASE WHEN TG_OP = 'INSERT' THEN NEW.period_id ELSE OLD.period_id END;
  SELECT status INTO checked_status
  FROM monitoring_periods
  WHERE id = checked_period_id;

  IF checked_status = 'published' THEN
    IF TG_OP = 'UPDATE'
      AND current_app_role() = 'admin'
      AND NEW.organization_id = OLD.organization_id
      AND NEW.period_id = OLD.period_id
      AND NEW.channel_id = OLD.channel_id THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Published content may only be updated by an administrator';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_published_period_change() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'published' THEN
    IF TG_OP = 'DELETE' OR current_app_role() IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Published periods may only be edited by an administrator';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status
      OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.published_at IS DISTINCT FROM OLD.published_at THEN
      RAISE EXCEPTION 'Only the date range of a published period may be changed';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
