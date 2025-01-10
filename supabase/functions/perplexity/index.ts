import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

// Update CORS headers to allow requests from app.yfetch.com
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.yfetch.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, // Use 204 for preflight responses
      headers: corsHeaders
    });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Verify the JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse and validate request body
    const { messages, model } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!model) {
      return new Response(
        JSON.stringify({ error: 'Model parameter is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for API key
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Forward request to Perplexity
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: errorData
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Perplexity API error',
          details: errorData,
          status: response.status
        }),
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name
      }), 
      { 
        status: error.message.includes('authorization') ? 401 : 500,
        headers: corsHeaders
      }
    );
  }
});