import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Lipana M-PESA callback received:", JSON.stringify(body, null, 2));

    // Lipana callback structure
    const { 
      success, 
      reference, 
      receipt_number, 
      phone,
      amount,
      status,
      message
    } = body;

    if (success || status === "success" || status === "completed") {
      // Payment successful - update order status
      const { error } = await supabaseClient
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reference);

      if (error) {
        console.error("Error updating order:", error);
      } else {
        console.log(`Payment successful for order ${reference}. Receipt: ${receipt_number}`);
      }
    } else {
      // Payment failed
      console.error("Payment failed:", message || status);
      
      // Update order status to failed/cancelled
      await supabaseClient
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reference);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Callback processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
