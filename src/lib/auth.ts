import NextAuth, { Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { SpaceDFClient } from './spacedf'
import { JWT } from 'next-auth/jwt'

const MINUTES_EXPIRE = 58
const TOKEN_EXPIRE_TIME = MINUTES_EXPIRE * 60 * 1000

async function performRefresh(token: JWT): Promise<JWT> {
  try {
    const spaceDFInstance = await SpaceDFClient.getInstance()
    const client = spaceDFInstance.getClient()
    const refreshedTokens = await client.auth.refreshToken({
      refresh: token.refresh,
    })

    return {
      ...token,
      access: refreshedTokens.access as string,
      refresh: refreshedTokens.refresh,
      accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
      error: undefined,
    }
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

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
    maxAge: TOKEN_EXPIRE_TIME,
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
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }
      }

      // Return previous token if not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Token expired, refresh it
      return await performRefresh(token)
    },
  },
  trustHost: true,
})
