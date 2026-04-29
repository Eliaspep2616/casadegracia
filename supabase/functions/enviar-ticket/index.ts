import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cabeceras estrictas para evitar bloqueos del navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NUEVO: Función para firmar criptográficamente el ID usando la API nativa de Deno
async function generarQRSeguro(ticket_id: string, secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  // Importamos la llave para HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Firmamos el UUID
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ticket_id));
  
  // Convertimos el ArrayBuffer a formato Hexadecimal
  const hexSignature = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `${ticket_id}|${hexSignature}`;
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

    // Recibimos los datos
    const { email, nombre, ticket_id } = await req.json();
    
    if (!ticket_id) throw new Error("Falta el ID del ticket para generar el QR");

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error("No se encontró la llave de Resend en el servidor");

    // Generamos el QR de forma segura
    const SECRET_KEY = Deno.env.get('QR_SECRET_KEY') || 'IglesiCDG@';
    const qr_data = await generarQRSeguro(ticket_id, SECRET_KEY);

    // ==========================================
    // PLANTILLA HTML PREMIUM PARA EL CORREO
    // ==========================================
    const correoHTML = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- IMAGEN PRINCIPAL DE GROW (Asegúrate de poner la URL real aquí) -->
        <img src="https://casadegraciaec.org/portada-oficial.jpg" alt="GROW 2026" style="width: 100%; height: auto; display: block;" />

        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; text-align: center; margin-top: 0;">¡Hola, ${nombre}!</h2>
          <p style="text-align: center; font-size: 16px; line-height: 1.6;">
            ¡Estamos emocionados de que seas parte de <strong>GROW 2026</strong>!
          </p>

          <p style="text-align: center; font-size: 15px; color: #475569;">
            En este ticket están incluidos los 2 días de nuestro Retiro de Provisión, en los siguientes horarios:
          </p>

          <!-- CAJA DE HORARIOS -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 15px;">📅 <strong>Viernes 29 de mayo</strong><br><span style="color: #64748b;">18H00 - 21H00</span></p>
            <p style="margin: 0; font-size: 15px;">📅 <strong>Sábado 30 de mayo</strong><br><span style="color: #64748b;">18H00 - 21H00</span></p>
          </div>

          <p style="text-align: center; font-size: 15px; color: #0f172a;">
            Nos vemos en Casa de Gracia para vivir una experiencia inolvidable. <br><strong>¡Te esperamos!</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;" />

          <h3 style="color: #0f172a; font-size: 18px;">Información General</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Nos llena de alegría saber que juntos estamos respondiendo a la convocatoria del Espíritu para ser la iglesia gloriosa que Él espera en los últimos tiempos. A continuación, te compartimos algunas indicaciones importantes:
          </p>

          <!-- SECCIÓN ENTRADA Y QR -->
          <h4 style="color: #0f172a; margin-bottom: 5px; font-size: 16px;">🎟️ Entrada</h4>
          <p style="margin-top: 0; font-size: 14px; line-height: 1.6; color: #475569;">
            Recuerda llevar tu código QR, el cual será escaneado el día del evento por nuestros voluntarios. No olvides tenerla a mano, puedes presentarla desde tu móvil o en versión impresa.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr_data)}" alt="Tu Código QR" style="border: 3px solid #0f172a; border-radius: 16px; padding: 15px;" />
            <p style="font-size: 12px; color: #94a3b8; margin-top: 15px; letter-spacing: 1px;">ID: ${ticket_id}</p>
          </div>

          <!-- SECCIÓN NOVEDADES -->
          <h4 style="color: #0f172a; margin-bottom: 5px; font-size: 16px;">📌 Novedades</h4>
          <p style="margin-top: 0; font-size: 14px; line-height: 1.6; color: #475569;">
            <strong style="color: #ef4444;">No se permite guardar asientos.</strong><br><br>
            Síguenos en nuestras redes sociales para conocer todas las novedades que estaremos preparando para la conferencia.
          </p>
          <p>
            <a href="https://www.instagram.com/casadegraciaec" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 14px;">➔ Síguenos en Instagram</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;" />

          <!-- SECCIÓN AYUDA -->
          <h4 style="color: #0f172a; margin-bottom: 5px; font-size: 16px;">¿Necesitas ayuda?</h4>
          <p style="margin-top: 0; font-size: 14px; line-height: 1.6; color: #475569;">
            Si tienes alguna pregunta o necesitas más información, puedes escribirnos por WhatsApp haciendo clic en el botón de ayuda.
          </p>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://wa.me/593969018532" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">📲 Escríbenos por WhatsApp</a>
          </div>

          <p style="text-align: center; font-weight: 900; margin-top: 40px; font-size: 20px; color: #0f172a; letter-spacing: 1px;">
            ¡JUNTOS LO ESTAMOS HACIENDO!
          </p>
        </div>
      </div>
    `;

    // Envío por Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Retiro CDG <tickets@casadegraciaec.org>",
        to: [email],
        subject: `🎟️ Tu entrada para GROW 2026: ${nombre}`,
        html: correoHTML,
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
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});