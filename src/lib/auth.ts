import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // MVP: no email provider wired up. Reset links are logged to the server
    // console so the flow is fully testable locally. Swap in a real mailer
    // (Resend, Postmark, etc.) here for production.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[ScaleIQ] Password reset for ${user.email}: ${url}`);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
