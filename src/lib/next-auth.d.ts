import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    certified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
      certified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    certified?: boolean;
  }
}
