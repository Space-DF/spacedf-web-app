import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { spaceClient, SpaceDFClient } from './spacedf'

const MINUTES_EXPIRE = 60
const TOKEN_EXPIRE_TIME = MINUTES_EXPIRE * 60 * 1000

export const { auth, handlers, signIn, signOut } = NextAuth({
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
    maxAge: TOKEN_EXPIRE_TIME,
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.access = token.access
        session.user.refresh = token.refresh
      }
      return session
    },
    async jwt({ token, user }) {
      const client = await spaceClient()
      // Handle new user login
      if (user) {
        token.access = user.access
        token.refresh = user.refresh
        return {
          ...token,
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }
      }
      // Early return if we have a valid token and no user data
      const isExpired = Number(token.accessTokenExpires) < Date.now()
      if (isExpired) {
        try {
          const { access, refresh } = await client.auth.refreshToken({
            refresh: token.refresh,
            space_slug_name: 'space-1',
          })

          if (access && refresh) {
            token.access = access
            token.refresh = refresh
            token.accessTokenExpires = Date.now() + TOKEN_EXPIRE_TIME
            return token
          }
        } catch {
          return token
        }
      }
      return token
    },
  },
})
