-- The doctor loop: a snapshot of her health report that a clinician can open
-- in a browser with no account, and reply to in one line.
--
-- Deliberately a SNAPSHOT, not live access. The whole report is computed on
-- her phone (mobile/src/lib/healthReport.ts) and that is a brand promise, not
-- an implementation detail — so the phone publishes one frozen, explicitly
-- chosen version rather than granting a standing window into her account.
-- It is also the clinically correct object: the record as it stood at the
-- consultation, the same thing a printed PDF would have been.
--
-- Follows the access shape already proven by fertility_share_links
-- (20260819000000): the token table is never readable by anon, and every
-- path from a token to data goes through a SECURITY DEFINER function that is
-- itself the access-control boundary. What's new here is a passcode, an
-- expiry, and a write-back path.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Links
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS doctor_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),

  -- bcrypt, never the plaintext. The 4-digit code is returned exactly once,
  -- by create_doctor_share, and after that exists only in her app's memory
  -- and on the slip of paper she reads to her doctor.
  passcode_hash text NOT NULL,

  -- The rendered report, as JSON. See buildDoctorSnapshot in
  -- mobile/src/lib/doctorShare.ts for the shape; the web viewer at
  -- /report/[token] renders it and nothing else.
  snapshot jsonb NOT NULL,
  -- Bumped when the snapshot shape changes, so an old link opened after a
  -- deploy renders with the reader that matches it rather than half-blank.
  snapshot_version int NOT NULL DEFAULT 1,

  -- Her name at snapshot time, so the doctor's page can be headed correctly
  -- without the viewer ever reaching into her profile.
  patient_label text,
  -- What she called this link ("Dr Kalra, Lilavati") — for her own list, so
  -- three links don't read as three identical rows. Never shown to a viewer.
  doctor_label text,

  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,

  last_viewed_at timestamptz,
  view_count int NOT NULL DEFAULT 0,

  -- Brute-force control. The token itself is 24 random bytes and effectively
  -- unguessable, so the passcode only matters once a link has LEAKED — a
  -- forwarded WhatsApp message, the wrong contact. Against an attacker who
  -- already holds the token, a hard lock (not a cooldown) is what makes four
  -- digits safe: ten guesses out of ten thousand is a 0.1% ceiling, where a
  -- timed cooldown over a 30-day life would eventually exhaust the space.
  -- Locking is therefore permanent until she regenerates — and the lock is
  -- surfaced to her in the app, because "someone kept guessing your code" is
  -- something she should be told, not something to silently absorb.
  failed_attempts int NOT NULL DEFAULT 0,
  locked_at timestamptz
);

COMMENT ON TABLE doctor_share_links IS 'Passcode-protected, expiring snapshot links to a health report, for a clinician with no Rove account. Revoked by setting revoked_at rather than deleting, so a stale copied link fails closed.';
COMMENT ON COLUMN doctor_share_links.snapshot IS 'The frozen report as JSON, computed on her device. Never recomputed server-side — the analysis lives in the app and must not fork.';

ALTER TABLE doctor_share_links ENABLE ROW LEVEL SECURITY;

-- Owner-only on the table itself. A clinician viewing a link never touches
-- this table; the SECURITY DEFINER functions below are the only path in.
DROP POLICY IF EXISTS "Users can view own doctor links" ON doctor_share_links;
CREATE POLICY "Users can view own doctor links" ON doctor_share_links
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can revoke own doctor links" ON doctor_share_links;
CREATE POLICY "Users can revoke own doctor links" ON doctor_share_links
  FOR UPDATE USING (auth.uid() = user_id);
-- No INSERT policy on purpose: creation goes through create_doctor_share,
-- so the passcode is generated server-side and the app can never pick a weak
-- one (or accidentally store the plaintext alongside the hash).

CREATE INDEX IF NOT EXISTS idx_doctor_share_links_user ON doctor_share_links (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_share_links_token ON doctor_share_links (token) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- Notes written back by the clinician
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES doctor_share_links ON DELETE CASCADE NOT NULL,
  -- Denormalised from the link so RLS is a plain column check and survives
  -- the link later being revoked — a revoked link must not retract advice she
  -- has already accepted and may be acting on.
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Self-declared, and shown to her as self-declared. Rove does not verify
  -- credentials and the UI must never imply otherwise.
  doctor_name text NOT NULL,
  doctor_clinic text,
  doctor_registration text,

  -- Verbatim, always. Nothing in this app may summarise, rephrase, translate
  -- or feed this text to a model — it is a clinician's words to their patient
  -- and it is a record. Display it as written or not at all.
  note_text text NOT NULL,

  -- Optional structured follow-ups the app can act on, e.g.
  --   [{"type":"recheck","test":"TSH","inWeeks":8},
  --    {"type":"supplement","product":"Balance","action":"continue"},
  --    {"type":"followup","inWeeks":12}]
  -- Advisory only: the free text above is the authoritative instruction, and
  -- these never override or replace it.
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- pending until she confirms it really came from the doctor she handed the
  -- link to. Anyone holding a live link can write; only she can promote that
  -- writing into medical advice inside her app.
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),

  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

COMMENT ON TABLE doctor_notes IS 'One-line replies written by a clinician through a share link. Immutable once written (see doctor_notes_reject_content_edit); the patient may only accept or decline.';
COMMENT ON COLUMN doctor_notes.note_text IS 'Verbatim clinician text. Never summarised, rephrased, translated, or sent to an AI service.';

ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own doctor notes" ON doctor_notes;
CREATE POLICY "Users can view own doctor notes" ON doctor_notes
  FOR SELECT USING (auth.uid() = user_id);
-- She may respond to a note (accept/decline). The trigger below is what stops
-- that UPDATE from also touching the content.
DROP POLICY IF EXISTS "Users can respond to own doctor notes" ON doctor_notes;
CREATE POLICY "Users can respond to own doctor notes" ON doctor_notes
  FOR UPDATE USING (auth.uid() = user_id);
-- No INSERT policy: writes arrive only via submit_doctor_note.
-- No DELETE policy: a clinical record is not deletable from inside the app.

CREATE INDEX IF NOT EXISTS idx_doctor_notes_user ON doctor_notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_link ON doctor_notes (share_link_id);

-- Medico-legal: what a doctor wrote must read the same in a year. She can
-- move status pending -> accepted/declined and nothing else; every content
-- column is frozen at insert.
CREATE OR REPLACE FUNCTION doctor_notes_reject_content_edit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.note_text IS DISTINCT FROM OLD.note_text
     OR NEW.actions IS DISTINCT FROM OLD.actions
     OR NEW.doctor_name IS DISTINCT FROM OLD.doctor_name
     OR NEW.doctor_clinic IS DISTINCT FROM OLD.doctor_clinic
     OR NEW.doctor_registration IS DISTINCT FROM OLD.doctor_registration
     OR NEW.share_link_id IS DISTINCT FROM OLD.share_link_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'doctor_notes content is immutable; only status may change';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS doctor_notes_immutable ON doctor_notes;
CREATE TRIGGER doctor_notes_immutable
  BEFORE UPDATE ON doctor_notes
  FOR EACH ROW EXECUTE FUNCTION doctor_notes_reject_content_edit();

-- ---------------------------------------------------------------------------
-- The only paths from a token to data
-- ---------------------------------------------------------------------------

-- Ten guesses, then the link is dead until she regenerates. See the note on
-- doctor_share_links.failed_attempts for why a hard lock rather than a
-- cooldown is what makes a four-digit code defensible here.
CREATE OR REPLACE FUNCTION doctor_share_max_attempts() RETURNS int
  LANGUAGE sql IMMUTABLE AS $$ SELECT 10 $$;

-- At most this many notes per link, so a leaked link can't be used to flood
-- her pending list.
CREATE OR REPLACE FUNCTION doctor_share_max_notes() RETURNS int
  LANGUAGE sql IMMUTABLE AS $$ SELECT 5 $$;

-- Shared gate for both viewer-facing functions. Never granted to anon — it
-- is reached only from the two functions below, which run as the definer.
--
-- Returns one of: ok | not_found | bad_passcode | locked. Unknown, revoked
-- and expired all collapse to not_found so a stale link can't be used to
-- probe what once existed; bad_passcode IS distinguished from not_found,
-- because the caller already holds the token (so it leaks nothing they don't
-- have) and a doctor who fat-fingered a digit deserves to be told so.
CREATE OR REPLACE FUNCTION doctor_share_check(
  p_token text,
  p_passcode text,
  OUT o_status text,
  OUT o_link_id uuid,
  OUT o_user_id uuid,
  OUT o_attempts_left int
)
LANGUAGE plpgsql
SECURITY DEFINER
-- `extensions` is on the path because crypt() comes from pgcrypto, which
-- Supabase installs there rather than in public. Pinned to these two schemas
-- and no more: a SECURITY DEFINER function with a loose search_path is how
-- privilege escalation gets in.
SET search_path = public, extensions
AS $$
DECLARE
  v_link doctor_share_links%ROWTYPE;
BEGIN
  o_status := 'not_found';
  o_attempts_left := 0;

  SELECT * INTO v_link FROM doctor_share_links WHERE token = p_token;

  IF v_link.id IS NULL OR v_link.revoked_at IS NOT NULL OR v_link.expires_at < now() THEN
    RETURN;
  END IF;

  IF v_link.locked_at IS NOT NULL THEN
    o_status := 'locked';
    RETURN;
  END IF;

  IF v_link.passcode_hash <> crypt(coalesce(p_passcode, ''), v_link.passcode_hash) THEN
    UPDATE doctor_share_links
    SET failed_attempts = failed_attempts + 1,
        locked_at = CASE
          WHEN failed_attempts + 1 >= doctor_share_max_attempts() THEN now()
          ELSE NULL
        END
    WHERE id = v_link.id
    RETURNING failed_attempts, locked_at INTO v_link.failed_attempts, v_link.locked_at;

    o_status := CASE WHEN v_link.locked_at IS NOT NULL THEN 'locked' ELSE 'bad_passcode' END;
    o_attempts_left := greatest(doctor_share_max_attempts() - v_link.failed_attempts, 0);
    RETURN;
  END IF;

  -- A correct code clears the running count, so an earlier typo doesn't
  -- accumulate across weeks toward a lock during a legitimate consultation.
  IF v_link.failed_attempts > 0 THEN
    UPDATE doctor_share_links SET failed_attempts = 0 WHERE id = v_link.id;
  END IF;

  o_status := 'ok';
  o_link_id := v_link.id;
  o_user_id := v_link.user_id;
  o_attempts_left := doctor_share_max_attempts();
END;
$$;

REVOKE ALL ON FUNCTION doctor_share_check(text, text) FROM PUBLIC, anon, authenticated;

-- The clinician's read. Hands back the frozen snapshot and nothing else —
-- no user_id, no live tables, no way to walk from here into her account.
CREATE OR REPLACE FUNCTION get_doctor_share(p_token text, p_passcode text)
RETURNS TABLE (
  status text,
  patient_label text,
  snapshot jsonb,
  snapshot_version int,
  shared_at timestamptz,
  expires_at timestamptz,
  attempts_left int,
  already_replied boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_check record;
  v_link doctor_share_links%ROWTYPE;
BEGIN
  SELECT * INTO v_check FROM doctor_share_check(p_token, p_passcode);

  IF v_check.o_status <> 'ok' THEN
    RETURN QUERY SELECT v_check.o_status, NULL::text, NULL::jsonb, NULL::int,
                        NULL::timestamptz, NULL::timestamptz, v_check.o_attempts_left, false;
    RETURN;
  END IF;

  UPDATE doctor_share_links
  SET last_viewed_at = now(), view_count = view_count + 1
  WHERE id = v_check.o_link_id
  RETURNING * INTO v_link;

  RETURN QUERY
  SELECT 'ok'::text,
         v_link.patient_label,
         v_link.snapshot,
         v_link.snapshot_version,
         v_link.created_at,
         v_link.expires_at,
         doctor_share_max_attempts(),
         EXISTS (SELECT 1 FROM doctor_notes dn WHERE dn.share_link_id = v_link.id);
END;
$$;

-- The write-back. One line from the clinician, plus optional structured
-- follow-ups. Lands as 'pending': it does not become advice inside her app
-- until she confirms it came from the doctor she handed the link to.
CREATE OR REPLACE FUNCTION submit_doctor_note(
  p_token text,
  p_passcode text,
  p_doctor_name text,
  p_note_text text,
  p_doctor_clinic text DEFAULT NULL,
  p_doctor_registration text DEFAULT NULL,
  p_actions jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE (status text, attempts_left int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_check record;
  v_count int;
  v_name text := btrim(coalesce(p_doctor_name, ''));
  v_note text := btrim(coalesce(p_note_text, ''));
BEGIN
  SELECT * INTO v_check FROM doctor_share_check(p_token, p_passcode);

  IF v_check.o_status <> 'ok' THEN
    RETURN QUERY SELECT v_check.o_status, v_check.o_attempts_left;
    RETURN;
  END IF;

  IF v_name = '' OR v_note = '' THEN
    RETURN QUERY SELECT 'invalid'::text, v_check.o_attempts_left;
    RETURN;
  END IF;

  -- Bounded so a leaked link can't be used to flood her, and so one note is
  -- long enough to be a real instruction but not a document.
  IF length(v_note) > 2000 OR length(v_name) > 120
     OR length(coalesce(p_doctor_clinic, '')) > 160
     OR length(coalesce(p_doctor_registration, '')) > 60 THEN
    RETURN QUERY SELECT 'invalid'::text, v_check.o_attempts_left;
    RETURN;
  END IF;

  IF jsonb_typeof(coalesce(p_actions, '[]'::jsonb)) <> 'array'
     OR jsonb_array_length(coalesce(p_actions, '[]'::jsonb)) > 10 THEN
    RETURN QUERY SELECT 'invalid'::text, v_check.o_attempts_left;
    RETURN;
  END IF;

  SELECT count(*) INTO v_count FROM doctor_notes WHERE share_link_id = v_check.o_link_id;
  IF v_count >= doctor_share_max_notes() THEN
    RETURN QUERY SELECT 'too_many_notes'::text, v_check.o_attempts_left;
    RETURN;
  END IF;

  INSERT INTO doctor_notes (
    share_link_id, user_id, doctor_name, doctor_clinic, doctor_registration, note_text, actions
  ) VALUES (
    v_check.o_link_id, v_check.o_user_id, v_name,
    nullif(btrim(coalesce(p_doctor_clinic, '')), ''),
    nullif(btrim(coalesce(p_doctor_registration, '')), ''),
    v_note, coalesce(p_actions, '[]'::jsonb)
  );

  RETURN QUERY SELECT 'ok'::text, doctor_share_max_attempts();
END;
$$;

-- Creation is server-side so the passcode is generated with pgcrypto rather
-- than chosen by the client, and the plaintext is returned exactly once —
-- it is never stored, and cannot be recovered afterwards. If she loses it,
-- she regenerates, which is also the correct outcome.
CREATE OR REPLACE FUNCTION create_doctor_share(
  p_snapshot jsonb,
  p_patient_label text DEFAULT NULL,
  p_doctor_label text DEFAULT NULL,
  p_valid_days int DEFAULT 30
)
RETURNS TABLE (token text, passcode text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
-- See doctor_share_check: crypt(), gen_salt() and gen_random_bytes() are
-- pgcrypto, which lives in `extensions` on Supabase.
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_bytes bytea := gen_random_bytes(3);
  v_passcode text;
  v_days int := least(greatest(coalesce(p_valid_days, 30), 1), 90);
  v_row doctor_share_links%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Three random bytes (16.7M) reduced mod 10000, so the modulo bias is
  -- ~0.004% rather than the ~16% two bytes would give.
  v_passcode := lpad(((
      (get_byte(v_bytes, 0)::bigint << 16) |
      (get_byte(v_bytes, 1)::bigint << 8)  |
       get_byte(v_bytes, 2)::bigint
    ) % 10000)::text, 4, '0');

  -- One live doctor link at a time. Regenerating must kill the old one, or a
  -- link she believes she turned off is still sitting in someone's chat.
  UPDATE doctor_share_links
  SET revoked_at = now()
  WHERE user_id = v_user_id AND revoked_at IS NULL;

  INSERT INTO doctor_share_links (user_id, passcode_hash, snapshot, patient_label, doctor_label, expires_at)
  VALUES (
    v_user_id,
    crypt(v_passcode, gen_salt('bf')),
    p_snapshot,
    nullif(btrim(coalesce(p_patient_label, '')), ''),
    nullif(btrim(coalesce(p_doctor_label, '')), ''),
    now() + make_interval(days => v_days)
  )
  RETURNING * INTO v_row;

  RETURN QUERY SELECT v_row.token, v_passcode, v_row.expires_at;
END;
$$;

REVOKE ALL ON FUNCTION get_doctor_share(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_doctor_note(text, text, text, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_doctor_share(jsonb, text, text, int) FROM PUBLIC;

-- The clinician is unauthenticated by design — that is the whole point.
GRANT EXECUTE ON FUNCTION get_doctor_share(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_doctor_note(text, text, text, text, text, text, jsonb) TO anon, authenticated;
-- Creating a link requires being signed in as the patient.
GRANT EXECUTE ON FUNCTION create_doctor_share(jsonb, text, text, int) TO authenticated;

COMMENT ON FUNCTION get_doctor_share IS 'The only way to read a health-report snapshot via a doctor share token. Returns a status plus the frozen snapshot; unknown, revoked and expired links are indistinguishable.';
COMMENT ON FUNCTION submit_doctor_note IS 'The only write path for a clinician reply. Always lands as pending — the patient promotes it to advice, not the link holder.';
