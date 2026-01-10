import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistNotificationRequest {
  email: string;
  name: string;
  productRequested: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, productRequested }: WaitlistNotificationRequest = await req.json();

    if (!email || !name || !productRequested) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Product Available - Kenya Shipment</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Kenya Shipment</h1>
            <p style="color: #d4af37; margin: 10px 0 0 0;">Premium Beauty for Melanin-Rich Skin</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Great News, ${name}! 🎉</h2>
            
            <p>The product you've been waiting for is now available!</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
              <p style="margin: 0; font-weight: bold;">Product you requested:</p>
              <p style="margin: 5px 0 0 0; color: #666;">${productRequested}</p>
            </div>
            
            <p>Visit our store now to get your hands on it before it sells out!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://kenyashipment.com/products" 
                 style="background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); 
                        color: #fff; 
                        padding: 14px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold;
                        display: inline-block;">
                Shop Now
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Thank you for your patience and for being a valued member of the Kenya Shipment community!
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Kenya Shipment. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kenya Shipment <noreply@kenyashipment.com>",
        to: [email],
        subject: `Good News! Your Requested Product is Now Available`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-waitlist-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
