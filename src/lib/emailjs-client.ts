import emailjs from "@emailjs/browser";
import { env } from "@/env";

export async function sendOtpEmail({
  email,
  otp,
  time,
}: {
  email: string;
  otp: string;
  time: string;
}) {
  return emailjs.send(
    env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    {
      email,
      passcode: otp,
      time,
    },
    env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  );
}
