import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { SpaceDFClient } from './spacedf'

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

          spaceDFInstance.setToken(data.access)

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
      const spaceDFInstance = await SpaceDFClient.getInstance()
      if (token) {
        session.user.access = token.access
        session.user.refresh = token.refresh
        spaceDFInstance.setToken(token.access)
      }
      return session
    },
    async jwt({ token, user }) {
      // const space = await getSpace()
      const spaceDFInstance = await SpaceDFClient.getInstance()
      // const client = await spaceClient()
      // Early return if we have a valid token and no user data
      // if (Number(token.accessTokenExpires) > Date.now() / 1000) {
      //   spaceDFInstance.setToken(token.access)
      //   return token
      // }
      // if (Number(token.accessTokenExpires) < Date.now() / 1000) {
      //   try {
      //     const { access, refresh } = await client.auth.refreshToken({
      //       refresh: token.refresh,
      //       space_slug_name:
      //     })

      //     if (access && refresh) {
      //       token.access = access
      //       token.refresh = refresh
      //       spaceDFInstance.setToken(access)
      //       return {
      //         ...token,
      //         accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Token refresh failed:', error)
      //     return token
      //   }
      // }

      // Handle new user login
      if (user) {
        token.access = user.access
        token.refresh = user.refresh
        spaceDFInstance.setToken(user.access)
        return {
          ...token,
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }
      }

      return token
    },
  },
  trustHost: true,
})
