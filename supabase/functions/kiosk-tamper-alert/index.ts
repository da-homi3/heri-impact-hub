import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_TYPES = new Set([
  'reed_switch','accelerometer','camera_pir','camera_offline','enclosure_open','power_loss','tamper_test',
]);
const ALLOWED_SEVERITY = new Set(['low','medium','high','critical']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const station_code = String(body.station_code || '').trim();
    const event_type = String(body.event_type || '').trim();
    const severity = String(body.severity || 'medium').trim();

    if (!station_code || !ALLOWED_TYPES.has(event_type)) {
      return new Response(JSON.stringify({ error: 'invalid station_code or event_type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!ALLOWED_SEVERITY.has(severity)) {
      return new Response(JSON.stringify({ error: 'invalid severity' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: station } = await supabase
      .from('arcade_stations').select('id').eq('station_code', station_code).maybeSingle();

    const { data: evt, error } = await supabase.from('arcade_tamper_events').insert({
      station_id: station?.id ?? null,
      station_code,
      event_type,
      severity,
      payload: body.payload ?? {},
      snapshot_url: body.snapshot_url ?? null,
    }).select().single();

    if (error) throw error;

    // Auto-flag the station for high/critical
    if (station && (severity === 'high' || severity === 'critical')) {
      await supabase.from('arcade_stations').update({ status: 'maintenance' }).eq('id', station.id);
    }

    return new Response(JSON.stringify({ ok: true, event_id: evt.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
