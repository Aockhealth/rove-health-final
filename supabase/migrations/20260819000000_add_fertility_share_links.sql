-- Shareable, read-only partner link for TTC fertile-window status.
--
-- Deliberately token-based rather than a second Rove account for the
-- partner: no invite flow, no second login, revocable by regenerating the
-- token. The token table itself is never directly readable by anon/public —
-- every read goes through get_shared_fertility_status below, which returns
-- only a minimal display subset (status/window/confidence), never the raw
-- ovulation_estimates row, the user_id, or anything else in her account.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS fertility_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_viewed_at timestamptz
);

ALTER TABLE fertility_share_links ENABLE ROW LEVEL SECURITY;

-- Owner-only access to the token table itself. A partner viewing the link
-- never queries this table directly — see the SECURITY DEFINER function
-- below, which is the only path from a token to any data.
DROP POLICY IF EXISTS "Users can view own share links" ON fertility_share_links;
CREATE POLICY "Users can view own share links" ON fertility_share_links
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own share links" ON fertility_share_links;
CREATE POLICY "Users can create own share links" ON fertility_share_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can revoke own share links" ON fertility_share_links;
CREATE POLICY "Users can revoke own share links" ON fertility_share_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fertility_share_links_user ON fertility_share_links (user_id);
CREATE INDEX IF NOT EXISTS idx_fertility_share_links_token ON fertility_share_links (token) WHERE revoked_at IS NULL;

COMMENT ON TABLE fertility_share_links IS 'Token-based read-only partner links for TTC fertile-window status. Revoke by setting revoked_at rather than deleting, so a stale client-side "link copied" state fails closed, not silently to a reused token.';

-- The one path from a token to data. SECURITY DEFINER so it can read
-- ovulation_estimates on the owner's behalf without granting the anon/public
-- role any direct table access — the function itself is the access-control
-- boundary, and it hands back only the fields a partner actually needs to
-- see, never the full signal_snapshot, contributing_signals, or user_id.
CREATE OR REPLACE FUNCTION get_shared_fertility_status(p_token text)
RETURNS TABLE (
  status text,
  confidence text,
  fertile_window_start date,
  fertile_window_end date,
  confirmed_date date,
  predicted_date date,
  computed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT fsl.user_id INTO v_user_id
  FROM fertility_share_links fsl
  WHERE fsl.token = p_token AND fsl.revoked_at IS NULL;

  IF v_user_id IS NULL THEN
    RETURN; -- unknown or revoked token: empty result, not an error, so a stale link fails quietly
  END IF;

  UPDATE fertility_share_links
  SET last_viewed_at = now()
  WHERE fertility_share_links.token = p_token;

  RETURN QUERY
  SELECT
    oe.status,
    oe.confidence,
    oe.fertile_window_start,
    oe.fertile_window_end,
    oe.confirmed_date,
    oe.predicted_date,
    oe.computed_at
  FROM ovulation_estimates oe
  WHERE oe.user_id = v_user_id
  ORDER BY oe.cycle_start DESC
  LIMIT 1;
END;
$$;

-- Callable by an unauthenticated partner opening the link (anon) and by a
-- logged-in user previewing their own link (authenticated) — never granted
-- to PUBLIC at the table level, only this narrow function.
GRANT EXECUTE ON FUNCTION get_shared_fertility_status(text) TO anon, authenticated;

COMMENT ON FUNCTION get_shared_fertility_status IS 'The only way to read fertility data via a share token. Returns the latest ovulation_estimates row''s display fields for the token''s owner, or an empty result for an unknown/revoked token.';
