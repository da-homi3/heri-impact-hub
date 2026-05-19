// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ticketId, email, buyerName, ticketType, quantity, amount, code } = await req.json();

    if (!ticketId || !buyerName || !ticketType) {
      return new Response(
        JSON.stringify({ error: "Missing required ticket details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured. Email mock logged successfully.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sending simulated because RESEND_API_KEY is not set.",
          mock: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine sender address
    const fromAddress = Deno.env.get("SENDER_EMAIL") || "Herizon Events <onboarding@resend.dev>";
    const toAddress = email || "events@herizon.com"; // Fallback to organizer if no email

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toAddress,
        subject: `Your Herizon Launch Event Ticket [${ticketType === "paid" ? "Event Pass" : "VIP Invite"}]`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #eaeaea; border-radius: 16px; background: #fafafa; color: #333333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #b89855; margin: 0; font-size: 24px; letter-spacing: 2px;">HERIZON LAUNCH</h2>
              <p style="color: #888888; font-size: 14px; margin: 5px 0 0 0;">Official Ticket Confirmation</p>
            </div>
            
            <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0;" />
            
            <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Ticket Holder</span>
                <p style="margin: 2px 0 0 0; font-size: 15px; font-weight: bold; color: #1a202c;">${buyerName}</p>
              </div>
              
              <div style="display: flex; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Ticket Type</span>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #1a202c;">${ticketType === "paid" ? "Launch Event Pass" : "Exclusive VIP Invite"}</p>
                </div>
                <div style="flex: 1;">
                  <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Quantity</span>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #1a202c;">${quantity} Ticket(s)</p>
                </div>
              </div>

              <div style="display: flex; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Code / Reference</span>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #b89855; text-transform: uppercase;">${code}</p>
                </div>
                <div style="flex: 1;">
                  <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Total Paid</span>
                  <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: bold; color: #1a202c;">KSh ${amount.toLocaleString()}</p>
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Date & Time</span>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #1a202c;">Saturday, 23rd May 2026, 4:00 PM - 8:00 PM</p>
              </div>

              <div>
                <span style="font-size: 11px; color: #888888; text-transform: uppercase;">Venue</span>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #1a202c;">Herizon Creative Space, Nairobi</p>
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 25px 0;" />
            
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #4a5568; margin-bottom: 15px;">Please present the QR code below at the entrance for verification check-in:</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticketId)}" alt="Ticket Verification QR Code" style="margin: 0 auto 15px auto; width: 160px; height: 160px; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; background: #ffffff; display: block;" />
              <p style="font-family: monospace; font-size: 11px; color: #a0aec0; margin: 0;">Ticket ID: ${ticketId}</p>
            </div>
            
            <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0;" />
            
            <p style="font-size: 11px; color: #a0aec0; text-align: center; margin: 0; line-height: 1.5;">
              This is an automated ticket confirmation from Herizon Impact Hub.<br />
              If you didn't purchase this ticket, please disregard this email.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Resend API returned error: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Ticket email sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
