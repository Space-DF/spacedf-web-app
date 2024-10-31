import NextAuth from 'next-auth/next'
import { SpaceUser } from './common'

declare module 'next-auth' {
  interface Session {
    user: User
  }

  type User = {
    id: string
    accessToken: string
    refreshToken: string
  } & any
}
