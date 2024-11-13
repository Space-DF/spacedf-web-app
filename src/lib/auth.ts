import { NEXTAUTH_SECRET } from '@/shared/env'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import SpacedfClient from '@space-df/sdk'
import { ApiResponse } from '@/types/global'

const client = new SpacedfClient({
  organization: 'spacedf-fe',
})

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    // maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
        sigUpSuccessfully: { label: 'signUpSuccess', type: 'boolean' },
        dataUser: { label: 'DataUser', type: 'string' },
      },

      async authorize(credentials) {
        if (!credentials) return null

        const { dataUser, email, password, sigUpSuccessfully } = credentials

        if (sigUpSuccessfully === 'true') {
          return JSON.parse(dataUser)
        }

        try {
          const data = await client.auth.login({ email, password })
          return {
            name: '',
            accessToken: data.access,
            refreshToken: data.refresh,
          }
        } catch (err) {
          const { error } = (err as ApiResponse) || {}
          throw new Error(error?.detail || 'Something went wrong')
        }
      },
    }),
  ],

  // debug: true,

  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user }
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken
      }

      return session
    },
  },
}
