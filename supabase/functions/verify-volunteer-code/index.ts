import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, access_code } = await req.json();

    if (!phone || !access_code) {
      return new Response(JSON.stringify({ error: "Phone and access code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up volunteer by phone + access_code
    const { data: volunteer, error: volError } = await supabaseAdmin
      .from("volunteers")
      .select("id, full_name, phone, email, access_code, status")
      .eq("phone", phone.trim())
      .eq("access_code", access_code.trim().toUpperCase())
      .eq("status", "approved")
      .maybeSingle();

    if (volError || !volunteer) {
      return new Response(JSON.stringify({ error: "Invalid phone number or access code" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a deterministic email from phone for auth
    const authEmail = `vol_${volunteer.phone.replace(/\D/g, "")}@herizon.volunteer`;
    const authPassword = volunteer.access_code;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = signInData?.users?.find((u) => u.email === authEmail);

    let userId: string;

    if (existingUser) {
      // Update password in case access code changed
      await supabaseAdmin.auth.admin.updateUser(existingUser.id, { password: authPassword });
      userId = existingUser.id;
    } else {
      // Create new auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: authPassword,
        email_confirm: true,
        user_metadata: { full_name: volunteer.full_name, volunteer_id: volunteer.id },
      });

      if (createError || !newUser.user) {
        return new Response(JSON.stringify({ error: "Failed to create session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = newUser.user.id;

      // Link volunteer to user_id
      await supabaseAdmin.from("volunteers").update({ user_id: userId }).eq("id", volunteer.id);
    }

    // Generate session tokens using signInWithPassword via the anon client
    // We use admin to generate a magic link token instead
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: authEmail,
    });

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: "Failed to generate session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return credentials for client-side sign in
    return new Response(
      JSON.stringify({
        email: authEmail,
        password: authPassword,
        volunteer_name: volunteer.full_name,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
