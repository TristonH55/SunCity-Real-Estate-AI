import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "agent" | "customer";
      approved: boolean;
      companyName: string;
    };
  }

  interface User {
    id: string;
    role: "admin" | "agent" | "customer";
    approved: boolean;
    companyName: string;
  }
}
