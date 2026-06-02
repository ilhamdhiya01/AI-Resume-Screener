import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/verify-request?token=${token}&email=${email}`;

  // TODO: Implement email sending logic here
  // You can use resend.emails.send() to send the email lHPwUe1FzSTRY9jH3uiVAXOWX164syRG

  await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${confirmLink}">here</a> to verify your email</p>`,
  });
};
