type EmailResult = { success: true; data?: unknown; mock?: boolean } | { success: false; error: unknown };

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  orderId?: string;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const resendKey = process.env['RESEND_API_KEY'];
  const lovableKey = process.env['LOVABLE_API_KEY'];

  if (!resendKey || !lovableKey) {
    console.error("Email connector is not configured");
    return { success: false, error: "Email connector is not configured" };
  }

  try {
    const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: process.env['EMAIL_FROM'] || "Ambition Sports <onboarding@resend.dev>",
        to: [payload.to],
        reply_to: payload.replyTo ? [payload.replyTo] : undefined,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const bodyText = await response.text();
    let body: unknown = bodyText;
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch {}

    if (!response.ok) {
      console.error(`Email gateway failed [${response.status}]: ${bodyText}`);
      return { success: false, error: `Email gateway failed [${response.status}]: ${bodyText}` };
    }

    return { success: true, data: body };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendInquiryEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  details?: Record<string, any>;
}) {
  const { name, email, subject, message, details } = data;
  const detailRows = details
    ? Object.entries(details)
        .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
        .join("")
    : "";

  const html = `
    <h2>New Inquiry from Ambition Sports</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    ${detailRows ? `<h3>Additional Details:</h3><ul>${detailRows}</ul>` : ""}
  `;

  return sendEmail({
    to: process.env['ADMIN_EMAIL'] || "ambitionsports381@gmail.com",
    replyTo: email,
    subject: `[Website Inquiry] ${subject}`,
    html,
  });
}

export async function sendOrderConfirmationEmail(data: {
  email: string;
  orderId: string;
  amount: number;
  items: any[];
}) {
  const { email, orderId, amount } = data;
  const subject = `Order Confirmation #${orderId.slice(0, 8)}`;
  const html = `
    <h2>Order Confirmed!</h2>
    <p>Thank you for your order from Ambition Sports.</p>
    <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
    <p><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
    <p>Our team is currently preparing your custom gear. You will receive another update once your order has shipped.</p>
  `;

  const result = await sendEmail({ to: email, subject, html, orderId });

  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await supabaseAdmin.from('email_logs').insert({
      recipient: email,
      subject,
      order_id: orderId,
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : String(result.error),
    });
  } catch (logErr) {
    console.error('Failed to log order email:', logErr);
  }

  return result;
}


export async function sendNewsletterWelcomeEmail(email: string) {
  const html = `
    <h2>Welcome to Ambition Sports</h2>
    <p>Thank you for subscribing to Ambition Sports updates.</p>
    <p>You will receive our latest custom sportswear launches, manufacturing updates, and quote-ready product news.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Ambition Sports Updates",
    html,
  });
}

export async function sendInvitationEmail(data: {
  email: string;
  role: string;
}) {
  const { email, role } = data;
  const siteUrl = process.env['SITE_URL'] || 'https://demositesale.lovable.app';
  const html = `
    <h2>Ambition Sports Access Granted</h2>
    <p>You have been granted <strong>${escapeHtml(role)}</strong> access to the Ambition Sports Control Panel.</p>
    <p>Please log in at <a href="${escapeHtml(siteUrl)}/auth">${escapeHtml(siteUrl)}/auth</a> using your email.</p>
    <p>If you don't have an account yet, use the password reset flow to set a password.</p>
  `;

  return sendEmail({
    to: email,
    subject: `Ambition Sports Access: ${role} Role Assigned`,
    html,
  });
}
