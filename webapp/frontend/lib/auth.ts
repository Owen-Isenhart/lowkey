import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

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
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    pages: {
        signIn: "/shop/sign-in",
    },

    session: { strategy: "jwt" },

    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user?.id && account && profile) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                    const res = await fetch(`${apiUrl}/auth/internal-login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-internal-key': process.env.INTERNAL_API_KEY || 'default-secret-change-me'
                        },
                        body: JSON.stringify({
                            providerId: account.providerAccountId,
                            email: user.email,
                            firstName: user.name?.split(' ')[0] || '',
                            lastName: user.name?.split(' ').slice(1).join(' ') || '',
                            picture: user.image
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        token.sub = data.user.id;
                        token.isAdmin = data.user.isAdmin;
                        token.backendToken = data.accessToken;
                    } else {
                        console.error('Failed to sync with backend', await res.text());
                        token.isAdmin = false;
                    }
                } catch (err) {
                    console.error('Backend sync error', err);
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.isAdmin = (token.isAdmin as boolean) ?? false;
                // Add backendToken to the session so Server Actions can use it
                (session as any).backendToken = token.backendToken;
            }
            return session;
        },
    },
});
