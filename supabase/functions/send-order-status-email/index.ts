import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  orderId: string;
  newStatus: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderId, newStatus }: OrderStatusEmailRequest = await req.json();

    console.log("Processing order status email:", { orderId, newStatus });

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, user_id, total")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Fetch user email using service role
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(order.user_id);

    if (userError || !user?.email) {
      throw new Error("User email not found");
    }

    console.log("Sending email to:", user.email);

    const statusMessages: Record<string, { subject: string; message: string }> = {
      paid: {
        subject: "Payment Confirmed - Order #" + orderId.substring(0, 8),
        message: "Your payment has been confirmed and your order is being processed.",
      },
      processing: {
        subject: "Order Processing - Order #" + orderId.substring(0, 8),
        message: "We're currently processing your order.",
      },
      shipped: {
        subject: "Order Shipped - Order #" + orderId.substring(0, 8),
        message: "Great news! Your order has been shipped and is on its way to you.",
      },
      delivered: {
        subject: "Order Delivered - Order #" + orderId.substring(0, 8),
        message: "Your order has been delivered. We hope you enjoy your purchase!",
      },
      cancelled: {
        subject: "Order Cancelled - Order #" + orderId.substring(0, 8),
        message: "Your order has been cancelled. If you have any questions, please contact us.",
      },
    };

    const emailContent = statusMessages[newStatus] || {
      subject: "Order Update - Order #" + orderId.substring(0, 8),
      message: `Your order status has been updated to: ${newStatus}`,
    };

    const emailResponse = await resend.emails.send({
      from: "Kenyashipment <onboarding@resend.dev>",
      to: [user.email],
      subject: emailContent.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .status-badge { display: inline-block; padding: 8px 16px; background: #1e3a5f; color: white; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 12px; margin: 20px 0; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Kenyashipment</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">Order Status Update</p>
              </div>
              <div class="content">
                <h2 style="margin-top: 0;">Hello!</h2>
                <p>${emailContent.message}</p>
                <div class="status-badge">${newStatus}</div>
                <div class="order-details">
                  <h3 style="margin-top: 0;">Order Details</h3>
                  <p><strong>Order ID:</strong> ${orderId.substring(0, 8)}...</p>
                  <p><strong>Total Amount:</strong> KES ${order.total.toLocaleString()}</p>
                  <p><strong>Status:</strong> ${newStatus}</p>
                </div>
                <p>Thank you for shopping with Kenyashipment!</p>
                <div class="footer">
                  <p>Kenyashipment - Fast & Reliable Logistics Across Kenya</p>
                  <p>If you have any questions, please don't hesitate to contact us.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending order status email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
