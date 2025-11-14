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

// M-PESA STK Push
async function initiateMpesaPayment(amount: number, phone: string, orderId: string) {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
  const passkey = Deno.env.get("MPESA_PASSKEY");
  const shortcode = Deno.env.get("MPESA_SHORTCODE");

  if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
    throw new Error("M-PESA credentials not configured");
  }

  // Get access token
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const tokenResponse = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const { access_token } = await tokenResponse.json();

  // Generate timestamp
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  // Generate password
  const password = btoa(`${shortcode}${passkey}${timestamp}`);

  // Format phone number (remove leading 0 or +254, add 254)
  let formattedPhone = phone.replace(/^\+?254|^0/, "");
  formattedPhone = `254${formattedPhone}`;

  // Initiate STK push
  const stkResponse = await fetch(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${Deno.env.get("VITE_SUPABASE_URL")}/functions/v1/mpesa-callback`,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${orderId}`,
      }),
    }
  );

  return await stkResponse.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "",
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

    if (paymentMethod === "mpesa") {
      const mpesaResponse = await initiateMpesaPayment(amount, phone, orderId);

      if (mpesaResponse.ResponseCode === "0") {
        // Update order status to processing
        await supabaseClient
          .from("orders")
          .update({ status: "processing" })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment initiated. Please enter your M-PESA PIN on your phone.",
            checkoutRequestId: mpesaResponse.CheckoutRequestID,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        throw new Error(mpesaResponse.ResponseDescription || "M-PESA payment failed");
      }
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
