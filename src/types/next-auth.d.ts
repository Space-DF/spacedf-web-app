import '@auth/core/jwt'

declare module '@auth/core/types' {
  interface Session {
    user: {
      access: string
      refresh: string
    } & DefaultSession['user'] &
      User
    error?: string
  }

  interface User {
    access: string
    refresh: string
  }

  interface Account {
    access: string
    refresh: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    access: string
    refresh: string
    accessTokenExpires?: number
    error?: string
  }
}
