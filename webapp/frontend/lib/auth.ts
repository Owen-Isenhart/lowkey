import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { queryOne } from "@/lib/db";

/**
 * NextAuth v5 configuration.
 *
 * Security approach:
 * - OAuth only — no passwords stored here.
 * - `isAdmin` is loaded from PostgreSQL on every JWT creation/refresh.
 * - The JWT is signed with NEXTAUTH_SECRET (HS256); the `isAdmin` field
 *   cannot be forged without the secret.
 * - Server Actions additionally re-verify via requireAdmin() (lib/admin-guard.ts),
 *   so a stolen non-admin JWT can never escalate privileges.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],

    pages: {
        signIn: "/shop/sign-in",
    },

    session: { strategy: "jwt" },

    callbacks: {
        /**
         * Runs when a JWT is created (sign-in) or refreshed.
         * We look up is_admin from the DB and store it in the token.
         * The token is signed — it cannot be tampered with by the client.
         */
        async jwt({ token, user }) {
            // `user` is only present on initial sign-in
            if (user?.id) {
                token.sub = user.id;
                // Look up admin status from the DB at sign-in time
                const row = await queryOne<{ is_admin: boolean }>(
                    "SELECT is_admin FROM users WHERE id = $1",
                    [user.id]
                ).catch(() => null);
                token.isAdmin = row?.is_admin ?? false;
            }
            return token;
        },

        /**
         * Exposes safe fields to the client session.
         * `isAdmin` comes from the signed JWT — not from client input.
         */
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.isAdmin = (token.isAdmin as boolean) ?? false;
            }
            return session;
        },
    },
});
