import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { NEXTAUTH_SECRET } from '@/shared/env'
import { SpaceDFClient } from './spacedf'
import { JWT } from 'next-auth/jwt'

const MINUTES_EXPIRE = 60
const TOKEN_EXPIRE_TIME = MINUTES_EXPIRE * 2 * 1000

// Race condition prevention
const refreshPromises = new Map<string, Promise<JWT>>()
const tokenCache = new Map<string, { token: JWT; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const refreshKey = token.refresh as string

  // 1. Check cache first
  const cached = tokenCache.get(refreshKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('🔄 Using cached refreshed token')
    return cached.token
  }

  // 2. Check if already refreshing
  const existingPromise = refreshPromises.get(refreshKey)
  if (existingPromise) {
    console.log('⏳ Reusing existing refresh promise')
    return existingPromise
  }

  // 3. Create new refresh promise
  console.log('🔄 Starting new token refresh')
  const refreshPromise = performRefresh(token)
  refreshPromises.set(refreshKey, refreshPromise)

  try {
    const newToken = await refreshPromise

    // Cache the result
    tokenCache.set(refreshKey, {
      token: newToken,
      timestamp: Date.now(),
    })

    return newToken
  } finally {
    // Always cleanup
    refreshPromises.delete(refreshKey)
  }
}

async function performRefresh(token: JWT): Promise<JWT> {
  try {
    const spaceDFInstance = await SpaceDFClient.getInstance()
    const client = spaceDFInstance.getClient()

    const refreshedTokens = await client.auth.refreshToken({
      refresh: token.refresh,
    })

    console.log('✅ Token refreshed successfully')

    return {
      ...token,
      access: refreshedTokens.access as string,
      refresh: refreshedTokens.refresh,
      accessTokenExpires: Date.now() + TOKEN_EXPIRE_TIME,
      error: undefined,
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

// Cleanup expired cache
setInterval(() => {
  const now = Date.now()
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      tokenCache.delete(key)
    }
  })
}, CACHE_TTL)

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
        session.error = token.error
      }
      return session
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
      return await refreshAccessToken(token)
    },
  },
  trustHost: true,
})
