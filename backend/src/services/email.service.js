import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Email Service
 *
 * Centralizes all transactional email sending for FitFlow.
 * Uses Nodemailer with SMTP transport configured via environment variables.
 *
 * Required .env variables (see env.example or .env):
 *   SMTP_HOST    - SMTP server hostname (e.g. smtp.mailtrap.io)
 *   SMTP_PORT    - SMTP server port (e.g. 587)
 *   SMTP_USER    - SMTP username / API key
 *   SMTP_PASS    - SMTP password
 *   SMTP_FROM    - Sender address (e.g. "FitFlow <noreply@fitflow.app>")
 *
 * If SMTP_HOST is not set, the service runs in NO-OP mode (just logs).
 */

/* ============================================================
   TRANSPORT FACTORY
   ============================================================ */

/**
 * Lazily creates and caches the Nodemailer transport.
 * Returns null if SMTP is not configured (safe no-op mode).
 */
let _transport = null;

function getTransport() {
  if (_transport) return _transport;

  const host = config.smtp?.host || process.env.SMTP_HOST;
  if (!host) {
    logger.warn('EMAIL', 'SMTP_HOST not configured. Email sending is disabled (no-op mode).');
    return null;
  }

  _transport = nodemailer.createTransport({
    host,
    port: Number(config.smtp?.port || process.env.SMTP_PORT || 587),
    secure: false, // Use STARTTLS
    auth: {
      user: config.smtp?.user || process.env.SMTP_USER,
      pass: config.smtp?.pass || process.env.SMTP_PASS,
    },
  });

  logger.info('EMAIL', `SMTP transport initialized: ${host}`);
  return _transport;
}

/* ============================================================
   SEND HELPERS
   ============================================================ */

/**
 * Low-level send function.
 * @param {Object} mailOptions - Nodemailer mail options.
 * @returns {Promise<boolean>} True if sent, false if no-op or error.
 */
async function sendMail(mailOptions) {
  const transport = getTransport();

  if (!transport) {
    // No-op mode: log but don't crash
    logger.info('EMAIL', '[NO-OP] Would send email', {
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    return false;
  }

  try {
    const from = process.env.SMTP_FROM || 'FitFlow <noreply@fitflow.app>';
    const info = await transport.sendMail({ from, ...mailOptions });
    logger.info('EMAIL', 'Email sent successfully', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info.messageId,
    });
    return true;
  } catch (err) {
    logger.error('EMAIL', 'Failed to send email', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      error: err.message,
    });
    return false;
  }
}

/* ============================================================
   PUBLIC API
   ============================================================ */

/**
 * Sends the auto-generated temporary password to a new client.
 * Called automatically after a gym admin creates a client with an email address.
 *
 * @param {string} email     - Recipient email address.
 * @param {string} nombre    - Client first name (for personalized greeting).
 * @param {string} password  - The plain-text temporary password (one-time use).
 * @returns {Promise<boolean>} True if email was sent.
 */
export async function sendTemporaryPassword(email, nombre, password) {
  const subject = '🏋️ Bienvenido/a a FitFlow — Tus credenciales de acceso';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        body  { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0b14; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #111422; border: 1px solid #1f2937;
                border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
        .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px 40px; color: #e5e7eb; }
        .body p  { line-height: 1.6; margin: 0 0 16px; }
        .cred-box { background: #0a0b14; border: 1px solid #6366f1; border-radius: 10px;
                    padding: 20px 24px; margin: 24px 0; }
        .cred-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
                           color: #6b7280; margin-bottom: 4px; }
        .cred-box .value { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700;
                           color: #a78bfa; letter-spacing: 0.05em; }
        .warning { font-size: 12px; color: #9ca3af; background: #1f2937; border-radius: 8px;
                   padding: 12px 16px; margin-top: 20px; }
        .footer { padding: 20px 40px; border-top: 1px solid #1f2937; font-size: 11px; color: #6b7280;
                  text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <h1>🏋️ FitFlow</h1>
          <p>Sistema de Gestión de Gimnasio</p>
        </div>
        <div class="body">
          <p>Hola, <strong>${nombre}</strong> 👋</p>
          <p>Tu cuenta en FitFlow ha sido creada exitosamente. A continuación encontrarás tu contraseña temporal de acceso:</p>
          <div class="cred-box">
            <div class="label">Tu contraseña temporal</div>
            <div class="value">${password}</div>
          </div>
          <p>Usa esta contraseña para iniciar sesión en la aplicación. <strong>Te recomendamos cambiarla en tu primer acceso</strong> desde la sección de perfil.</p>
          <div class="warning">
            ⚠️ Por razones de seguridad, este correo contiene información sensible.
            No lo reenvíes ni compartas tu contraseña con nadie.
          </div>
        </div>
        <div class="footer">
          FitFlow Management System &bull; Este es un mensaje automático, no respondas a este correo.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hola ${nombre},\n\nTu cuenta FitFlow ha sido creada.\n\nContraseña temporal: ${password}\n\nCámbiala en tu primer acceso desde la sección de perfil.\n\n— FitFlow`;

  return sendMail({ to: email, subject, html, text });
}

/**
 * Sends a password reset link to a user.
 * Wraps the existing token-based reset flow with a formatted email.
 *
 * @param {string} email   - Recipient email.
 * @param {string} nombre  - Recipient name.
 * @param {string} token   - The one-time reset token.
 * @param {string} resetUrl - Full URL of the reset form (e.g. https://app.fitflow.io/reset-password?token=xxx)
 * @returns {Promise<boolean>}
 */
export async function sendPasswordResetEmail(email, nombre, token, resetUrl) {
  const subject = '🔑 FitFlow — Recuperación de contraseña';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        body  { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0b14; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #111422; border: 1px solid #1f2937;
                border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px 40px; color: #e5e7eb; }
        .body p  { line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #6366f1; color: #fff !important; text-decoration: none;
               padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin: 8px 0; }
        .token-box { font-family: 'Courier New', monospace; background: #0a0b14; border: 1px solid #374151;
                     border-radius: 8px; padding: 12px 16px; color: #a78bfa; font-size: 14px;
                     word-break: break-all; margin: 16px 0; }
        .warning { font-size: 12px; color: #9ca3af; background: #1f2937; border-radius: 8px;
                   padding: 12px 16px; margin-top: 20px; }
        .footer { padding: 20px 40px; border-top: 1px solid #1f2937; font-size: 11px; color: #6b7280;
                  text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header"><h1>🔑 FitFlow</h1></div>
        <div class="body">
          <p>Hola, <strong>${nombre}</strong> 👋</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          ${resetUrl ? `<p><a href="${resetUrl}" class="btn">Restablecer contraseña</a></p>` : ''}
          <p>O usa este token directamente en la aplicación:</p>
          <div class="token-box">${token}</div>
          <div class="warning">⏱️ Este enlace expira en 30 minutos. Si no solicitaste este cambio, ignora este mensaje.</div>
        </div>
        <div class="footer">FitFlow Management System</div>
      </div>
    </body>
    </html>
  `;

  return sendMail({ to: email, subject, html });
}
