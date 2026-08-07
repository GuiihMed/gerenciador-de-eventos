// Configuração do transporter (env vars ou fallback em dev logger)
const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodemailer = require("nodemailer")
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      })
    } catch (err) {
      console.warn("Nodemailer não está instalado ou configurado. Usando simulador de e-mail.")
    }
  }

  // Fallback em ambiente de desenvolvimento (Simulador de envio)
  return {
    sendMail: async (options: any) => {
      console.log("==========================================")
      console.log("SIMULADOR DE ENVIO DE E-MAIL (Gerenciador de Eventos)")
      console.log(`Para: ${options.to}`)
      console.log(`Assunto: ${options.subject}`)
      console.log("Mensagem enviada com sucesso no ambiente local.")
      console.log("==========================================")
      return { messageId: "simulated-msg-id-" + Date.now() }
    }
  }
}

export const transporter = createTransporter()

// Template HTML de Confirmação de Inscrição + Ingresso com QR Code
export function generateTicketEmailHTML({
  attendeeName,
  eventName,
  ticketType,
  ticketUrl,
  qrCodeUrl,
  eventDate,
  eventLocation
}: {
  attendeeName: string
  eventName: string
  ticketType: string
  ticketUrl: string
  qrCodeUrl: string
  eventDate?: string
  eventLocation?: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; text-transform: uppercase; }
          .content { padding: 30px 20px; text-align: center; }
          .ticket-card { background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #334155; margin: 20px 0; text-align: center; }
          .badge { display: inline-block; background-color: #6366f1; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 10px; }
          .qr-container { background-color: #ffffff; padding: 15px; border-radius: 12px; display: inline-block; margin: 15px 0; }
          .qr-container img { width: 180px; height: 180px; display: block; }
          .button { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 12px; margin-top: 15px; font-size: 14px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${eventName}</h1>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; margin-top: 0;">Sua inscrição está confirmada! 🎉</h2>
            <p style="color: #94a3b8; font-size: 15px;">Olá <strong>${attendeeName}</strong>, recebemos sua inscrição para o evento.</p>
            
            <div class="ticket-card">
              <span class="badge">Ingresso ${ticketType || "STANDARD"}</span>
              <h3 style="color: #ffffff; margin: 5px 0;">${eventName}</h3>
              ${eventDate ? `<p style="color: #cbd5e1; font-size: 13px; margin: 5px 0;">📅 ${eventDate}</p>` : ''}
              ${eventLocation ? `<p style="color: #cbd5e1; font-size: 13px; margin: 5px 0;">📍 ${eventLocation}</p>` : ''}
              
              <div class="qr-container">
                <img src="${qrCodeUrl}" alt="QR Code do Ingresso" />
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 5px;">Apresente este QR Code na recepção para realizar seu credenciamento.</p>
            </div>

            <a href="${ticketUrl}" class="button">Acessar Ingresso Digital</a>
          </div>
          <div class="footer">
            <p>Enviado via <strong>Gerenciador de Eventos</strong></p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Template HTML para Comunicados em Massa
export function generateMassEmailHTML({
  eventName,
  subject,
  message
}: {
  eventName: string
  subject: string
  message: string
}) {
  const formattedMessage = message.replace(/\n/g, "<br />")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px 20px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
          .content { padding: 30px 24px; color: #cbd5e1; font-size: 15px; leading-height: 1.6; }
          .content h2 { color: #ffffff; margin-top: 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${eventName} — Comunicado Oficial</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <div style="line-height: 1.6;">${formattedMessage}</div>
          </div>
          <div class="footer">
            <p>Mensagem enviada pela organização do evento <strong>${eventName}</strong> via Gerenciador de Eventos</p>
          </div>
        </div>
      </body>
    </html>
  `
}
