import axiosInstance from '../axios';

interface TurnstileBodyRequest {
  secret: string;
  response: string;
}

export const verifyTurnstileToken = async (token: string): Promise<boolean> => {
  const secret = process.env.CLOUDFLARE_SECRET_KEY;
  if (!secret) {
    console.error('CLOUDFLARE_SECRET_KEY is not defined');
    return false;
  }

  try {
    const bodyRequest: TurnstileBodyRequest = {
      secret,
      response: token,
    };
    const response = await axiosInstance.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      bodyRequest
    );
    return response.data.success === true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
};
