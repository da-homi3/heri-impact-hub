-- Add lifecycle columns to arcade_sessions
ALTER TABLE public.arcade_sessions
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS console_id TEXT,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_arcade_sessions_entry_code ON public.arcade_sessions(entry_code);
CREATE INDEX IF NOT EXISTS idx_arcade_sessions_status ON public.arcade_sessions(status);

-- Public RPC: redeem an arcade code from a console.
-- First call activates (sets activated_at + expires_at). Subsequent calls return remaining time.
CREATE OR REPLACE FUNCTION public.redeem_arcade_code(_code TEXT, _console_id TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.arcade_sessions%ROWTYPE;
  remaining INTEGER;
BEGIN
  IF _code IS NULL OR length(trim(_code)) = 0 THEN
    RETURN jsonb_build_object('status', 'invalid', 'message', 'Code required');
  END IF;

  SELECT * INTO s FROM public.arcade_sessions
  WHERE entry_code = upper(trim(_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid', 'message', 'Code not found');
  END IF;

  -- First redemption: activate
  IF s.activated_at IS NULL THEN
    UPDATE public.arcade_sessions
      SET activated_at = now(),
          expires_at = now() + (COALESCE(s.duration_minutes, 60) || ' minutes')::interval,
          status = 'active',
          console_id = COALESCE(_console_id, console_id),
          last_heartbeat_at = now()
      WHERE id = s.id
      RETURNING * INTO s;

    RETURN jsonb_build_object(
      'status', 'activated',
      'player_name', s.player_name,
      'duration_minutes', s.duration_minutes,
      'activated_at', s.activated_at,
      'expires_at', s.expires_at,
      'seconds_remaining', GREATEST(0, EXTRACT(EPOCH FROM (s.expires_at - now()))::int)
    );
  END IF;

  -- Already activated: check expiry
  IF s.expires_at <= now() THEN
    IF s.status <> 'expired' THEN
      UPDATE public.arcade_sessions SET status = 'expired' WHERE id = s.id;
    END IF;
    RETURN jsonb_build_object(
      'status', 'expired',
      'player_name', s.player_name,
      'expired_at', s.expires_at
    );
  END IF;

  -- Active heartbeat
  UPDATE public.arcade_sessions
    SET last_heartbeat_at = now(),
        console_id = COALESCE(_console_id, console_id)
    WHERE id = s.id;

  remaining := GREATEST(0, EXTRACT(EPOCH FROM (s.expires_at - now()))::int);
  RETURN jsonb_build_object(
    'status', 'active',
    'player_name', s.player_name,
    'expires_at', s.expires_at,
    'seconds_remaining', remaining
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_arcade_code(TEXT, TEXT) TO anon, authenticated;