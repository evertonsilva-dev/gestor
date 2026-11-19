UPDATE client_access_keys
SET key_prefix = regexp_replace(key_prefix, '^[a-z][a-z0-9]*_', '')
WHERE key_prefix ~ '^[a-z][a-z0-9]*_client_';
