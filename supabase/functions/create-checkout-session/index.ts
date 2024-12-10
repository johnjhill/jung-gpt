import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user?.email) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get request body
    const { returnUrl } = await req.json();
    const origin = returnUrl || req.headers.get('origin') || 'http://localhost:5173';

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: 'price_1QUSwUIKNOujQeIQQMe2g7yn',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});