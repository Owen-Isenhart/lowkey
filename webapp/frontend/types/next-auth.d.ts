/**
 * NextAuth module augmentation.
 *
 * Extends the built-in Session and JWT types to include our custom fields
 * (`id` and `isAdmin`) so TypeScript knows about them everywhere.
 */
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isAdmin: boolean;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id?: string;
        isAdmin?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sub?: string;
        isAdmin?: boolean;
    }
}
