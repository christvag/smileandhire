import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@worky-happy/database"
import bcrypt from "bcryptjs"
type UserRole = 'ADMIN' | 'CLIENT' | 'APPLICANT';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "APPLICANT" as UserRole, // Default role for Google SSO users
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            company: true,
            applicant: true
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          image: user.avatar || undefined,
          role: user.role,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          username: user.id, // Temporary until username column exists
          company: user.company,
          applicant: user.applicant
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days = 168 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days = 168 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        // First time login, save user info to token
        token.accessToken = account.access_token
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.username = (user as any).username
        token.company = (user as any).company
        token.applicant = (user as any).applicant
        
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.username = token.username as string
        session.user.company = token.company as any
        session.user.applicant = token.applicant as any
        session.accessToken = token.accessToken as string
      }
      
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle Google SSO user creation/update
      if (account?.provider === "google" && profile) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Update existing user with Google info
            const nameParts = user.name?.split(' ') || []
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                avatar: user.image,
                isVerified: true,
                lastLogin: new Date()
              }
            })
          } else {
            // For new Google users, extract name parts
            const nameParts = user.name?.split(' ') || []
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            // Create new user
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                avatar: user.image,
                role: 'APPLICANT',
                isVerified: true,
                lastLogin: new Date()
              }
            })

            // Create applicant profile for new Google users
            await prisma.applicant.create({
              data: {
                userId: newUser.id,
                completionPercentage: 20 // Basic profile from Google
              }
            })

            user.id = newUser.id
          }
        } catch (error) {
          console.error('Error handling Google sign in:', error)
          return false
        }
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic based on user role
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in event
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
    async signOut({ token }) {
      // Log sign out event
      console.log(`User signed out`)
    }
  }
}