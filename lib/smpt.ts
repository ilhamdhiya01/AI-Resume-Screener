import nodemailer, { type Transporter } from 'nodemailer';

/**
 * @description Reusable Nodemailer SMTP transporter. Credentials are read from
 * environment variables so secrets never live in the source code.
 */
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== 'false', // true for port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * @description Build the absolute verification link, stripping any trailing
 * slash from the base URL and URL-encoding dynamic values.
 * @param {string} email - Recipient email address.
 * @param {string} token - Verification token.
 * @returns {string} The full verification URL.
 */
const buildConfirmLink = (email: string, token: string): string => {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );

  return `${baseUrl}/verify-request?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
};

/**
 * @description Send an account verification email via SMTP (Nodemailer).
 * @param {string} email - Recipient email address.
 * @param {string} token - Verification token used to build the confirm link.
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const confirmLink = buildConfirmLink(email, token);
  const fromAddress =
    process.env.SMTP_FROM || 'AI Resume Screener <no-reply@example.com>';

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${confirmLink}">here</a> to verify your email</p>`,
  });
};
