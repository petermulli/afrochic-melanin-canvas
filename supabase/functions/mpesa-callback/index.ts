import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

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
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("M-PESA callback received:", JSON.stringify(body, null, 2));

    const { Body } = body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const orderId = stkCallback.MerchantRequestID;

      // Extract payment details
      const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === "TransactionDate")?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value;

      // Update order status to paid
      const { error } = await supabaseClient
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
      }

      console.log(`Payment successful for order ${orderId}. Receipt: ${mpesaReceiptNumber}`);
    } else {
      // Payment failed
      console.error("Payment failed:", stkCallback.ResultDesc);
      
      // Optionally update order status to failed
      const orderId = stkCallback.MerchantRequestID;
      await supabaseClient
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
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
