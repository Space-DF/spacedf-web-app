import { NEXT_PUBLIC_AUTH_API, NEXTAUTH_SECRET } from '@/shared/env'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ApiResponse } from '@/types/global'
import { SpaceDFClient } from '@/lib/spacedf'
import { FetchAPI } from '@/lib/fecth'
import { JWT } from 'next-auth/jwt'

const MINUTES_EXPIRE = 60
const TOKEN_EXPIRE_TIME = MINUTES_EXPIRE * 60 * 1000

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
          const spaceDFInstance = await SpaceDFClient.getInstance()

          const client = spaceDFInstance.getClient()
          const data = await client.auth.login({ email, password })

          console.log({ data })
          spaceDFInstance.setToken(data.access)

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
    async jwt({ token, user, account }) {
      const spaceDfInstance = await SpaceDFClient.getInstance()
      spaceDfInstance.setToken((token as any)?.accessToken)

      if (account && user) {
        return {
          ...token,
          ...user,
          accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
        }
      }

      if (Date.now() < token.accessTokenExpires) return { ...token, ...user }

      const refreshToken = await refreshAccessToken(token)

      return { ...token, ...user, ...refreshToken }
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.firstName = token.first_name
        session.user.lastName = token.last_name
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken
      }

      return session
    },
  },
}

async function refreshAccessToken(token: JWT) {
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)

    const response = await fetch.post<{ access: string; refresh: string }>(
      'api/console/auth/refresh-token',
      { refresh: token.refreshToken }
    )

    return {
      ...token,
      accessToken: response.response_data.access,
      accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
      refreshToken: response.response_data.refresh ?? token.refreshToken,
    }
  } catch (error) {
    console.error(
      `\x1b[31mFunc: refreshAccessToken - PARAMS: error\x1b[0m`,
      JSON.stringify(error)
    )
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}
