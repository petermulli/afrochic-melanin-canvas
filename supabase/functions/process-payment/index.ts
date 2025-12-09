import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  phone: string;
  orderId: string;
  paymentMethod: "card" | "mpesa";
}

// Lipana M-PESA STK Push using their REST API
async function initiateMpesaPayment(amount: number, phone: string, orderId: string) {
  const lipanaApiKey = Deno.env.get("LIPANA_API_KEY");

  if (!lipanaApiKey) {
    throw new Error("Lipana API key not configured");
  }

  // Format phone number (ensure it starts with 254)
  let formattedPhone = phone.replace(/^\+/, "").replace(/^0/, "254");
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = `254${formattedPhone}`;
  }

  console.log(`Initiating Lipana payment for order ${orderId}, phone: ${formattedPhone}, amount: ${amount}`);

  // Lipana STK Push API - using the documented endpoint
  const response = await fetch("https://api.lipana.dev/stk/push", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lipanaApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: formattedPhone,
      amount: Math.round(amount),
      accountReference: orderId.slice(0, 12),
      transactionDesc: `AfroChic order ${orderId.slice(0, 8)}`,
    }),
  });

  console.log(`Lipana response status: ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();
  
  console.log(`Lipana raw response: ${responseText.substring(0, 500)}`);

  if (!contentType.includes("application/json")) {
    console.error(`Lipana returned non-JSON response: ${responseText.substring(0, 200)}`);
    throw new Error(`Payment service unavailable. Please try again later.`);
  }

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    console.error(`Failed to parse Lipana response: ${e}`);
    throw new Error("Payment service returned invalid data. Please try again later.");
  }

  console.log("Lipana response:", JSON.stringify(responseData));

  if (!response.ok) {
    throw new Error(responseData.message || responseData.error || "M-PESA payment initiation failed");
  }

  return responseData;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { amount, phone, orderId, paymentMethod }: PaymentRequest =
      await req.json();

    console.log(`Processing ${paymentMethod} payment for order ${orderId}`);

    if (paymentMethod === "mpesa") {
      const lipanaResponse = await initiateMpesaPayment(amount, phone, orderId);

      // Update order status to processing
      await supabaseClient
        .from("orders")
        .update({ status: "processing" })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment initiated. Please enter your M-PESA PIN on your phone.",
          checkoutRequestId: lipanaResponse.transactionId || lipanaResponse.checkout_request_id || lipanaResponse.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (paymentMethod === "card") {
      // Stripe integration can be added here later
      throw new Error("Card payments not yet configured");
    }

    throw new Error("Invalid payment method");
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
