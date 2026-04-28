import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { evento_id, nombre, cedula, telefono, correo, cantidad, turnstileToken } = await req.json();

    if (!turnstileToken) throw new Error("Falta la verificación de seguridad.");

    // Validar con Cloudflare
    const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA');
    formData.append('response', turnstileToken);

    const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const cfResult = await cfResponse.json();
    if (!cfResult.success) throw new Error("Verificación de seguridad fallida.");

    // Insertar en Base de Datos
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
      .from('registrados')
      .insert([{
        evento_id, nombre, cedula, telefono, correo, cantidad,
        pagado: false, usado: false
      }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ status: 'success', data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});