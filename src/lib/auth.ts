import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { jwtDecode } from 'jwt-decode'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { spaceClient, SpaceDFClient } from './spacedf'
import { AccessTokenPayload } from '@/types/token'

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
    async jwt({ token, user, trigger, session }) {
      const client = await spaceClient()
      // Handle session updates and token refresh
      if (
        trigger === 'update' ||
        (token && Number(token.accessTokenExpires) < Date.now())
      ) {
        let newTokenData = session

        // If token expired, get new tokens from API
        if (!newTokenData && token) {
          try {
            const decodedAccessToken = jwtDecode<AccessTokenPayload>(
              token.access
            )
            const { access, refresh } = await client.auth.refreshToken({
              refresh: token.refresh,
              space_slug_name: decodedAccessToken.space,
            })
            newTokenData = { access, refresh }
          } catch {
            return token
          }
        }

        // Update token with new data
        const newToken = {
          ...token,
          access: newTokenData?.access || token.access,
          refresh: newTokenData?.refresh || token.refresh,
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }

        return newToken
      }

      // Handle new user login
      if (user) {
        const newToken = {
          ...token,
          access: user.access,
          refresh: user.refresh,
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }
        return newToken
      }
      return token
    },
  },
  trustHost: true,
})
