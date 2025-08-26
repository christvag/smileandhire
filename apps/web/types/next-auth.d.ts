import NextAuth, { DefaultSession } from "next-auth"

type UserRole = 'ADMIN' | 'CLIENT' | 'APPLICANT';

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      firstName?: string
      lastName?: string
      username?: string
      company?: any
      applicant?: any
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User {
    id: string
    role: UserRole
    firstName?: string
    lastName?: string
    username?: string
    company?: any
    applicant?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    firstName?: string
    lastName?: string
    username?: string
    company?: any
    applicant?: any
    accessToken?: string
  }
}