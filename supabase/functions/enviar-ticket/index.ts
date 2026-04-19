import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cabeceras estrictas para evitar bloqueos del navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. EL SALUDO DEL NAVEGADOR (PREFLIGHT): Siempre decir que SÍ
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta el token de autorización");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Sesión inválida o expirada");

    const { email, nombre, qr_data } = await req.json();
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) throw new Error("No se encontró la llave de Resend en el servidor");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Retiro CDG <onboarding@resend.dev>",
        to: [email],
        subject: `🎟️ Ticket para el Retiro: ${nombre}`,
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>¡Hola, ${nombre}!</h2>
            <p>Aquí tienes tu pase para el retiro:</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr_data)}" />
          </div>
        `,
      }),
    });

    const resendData = await res.json();

    if (!res.ok) {
      throw new Error(`Resend rechazó el envío: ${JSON.stringify(resendData)}`);
    }

    return new Response(JSON.stringify({ ok: true, detail: "Correo enviado a Resend" }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    // Si ALGO falla, devolvemos el error PERO con las cabeceras CORS para que React pueda leerlo
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});