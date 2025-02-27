import { DefaultUser } from 'next-auth'

// import "next-auth/jwt";

// // Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth/jwt' {
  interface JWT {
    image?: string | null
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: DefaultUser & {
      email: string
      accessToken: string
      refreshToken: string
      image?: string | null
    }
    // userInfo: UserResponse;
  }

  interface User extends DefaultUser {
    id: string
    accessToken: string
    refreshToken: string
    email: string
    image?: string | null
    // userInfo: UserResponse;
  }
}
