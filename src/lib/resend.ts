import { Resend } from 'resend';

// Only initialize if the key is available, preventing build errors on CI without keys
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
