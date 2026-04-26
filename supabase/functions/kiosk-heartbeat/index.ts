import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const station_code = String(body.station_code || '').trim();
    if (!station_code) {
      return new Response(JSON.stringify({ error: 'station_code required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find or auto-register station
    let { data: station } = await supabase
      .from('arcade_stations').select('*').eq('station_code', station_code).maybeSingle();

    if (!station) {
      const { data: created, error: createErr } = await supabase
        .from('arcade_stations')
        .insert({
          station_code,
          name: body.name || station_code,
          location: body.location || 'Unassigned',
          console_id: body.console_id || null,
          camera_id: body.camera_id || null,
          status: 'active',
          ip_address: body.ip_address || null,
          last_heartbeat_at: new Date().toISOString(),
        })
        .select().single();
      if (createErr) throw createErr;
      station = created;
    } else {
      await supabase.from('arcade_stations').update({
        last_heartbeat_at: new Date().toISOString(),
        status: station.status === 'maintenance' ? 'maintenance' : 'active',
        ip_address: body.ip_address || station.ip_address,
        console_id: body.console_id || station.console_id,
        camera_id: body.camera_id || station.camera_id,
      }).eq('id', station.id);
    }

    await supabase.from('arcade_station_pings').insert({
      station_id: station.id,
      station_code,
      cpu_temp: body.cpu_temp ?? null,
      uptime_seconds: body.uptime_seconds ?? null,
      active_session_id: body.active_session_id ?? null,
      metadata: body.metadata ?? {},
    });

    return new Response(JSON.stringify({ ok: true, station_id: station.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
