import NextAuth, { Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { SpaceDFClient } from './spacedf'

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  secret: NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
        sigUpSuccessfully: { label: 'signUpSuccess', type: 'boolean' },
        dataUser: { label: 'DataUser', type: 'string' },
      },
      async authorize(credentials) {
        if (!credentials) return null
        const { sigUpSuccessfully, dataUser, email, password } = credentials
        if (sigUpSuccessfully === 'true') {
          return JSON.parse(dataUser as string)
        }
        try {
          const spaceDFInstance = await SpaceDFClient.getInstance()
          const client = spaceDFInstance.getClient()
          const data = await client.auth.login({
            email: email as string,
            password: password as string,
          })
          return data
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.access = token.access
        session.user.refresh = token.refresh
        session.user.error = token.error
      }
      return {} as Session
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          access: user.access,
          refresh: user.refresh,
        }
      }

      return token
    },
  },
  trustHost: true,
})
