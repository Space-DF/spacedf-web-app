import { getUserByEmail } from "@/data/user"
import { NEXTAUTH_SECRET } from "@/shared/env"
import { SpaceUser } from "@/types/common"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    // maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
        sigUpSuccessfully: { label: "signUpSuccess", type: "boolean" },
        dataUser: { label: "DataUser", type: "string" },
      },

      async authorize(credentials, req) {
        const credentialDetails = {
          email: credentials?.email,
          password: credentials?.password,
        }

        if (credentials?.sigUpSuccessfully === "true") {
          const dataUserParsed = JSON.parse(credentials.dataUser)

          return dataUserParsed
        }

        const resp = await fetch(
          process.env.NEXT_PUBLIC_CONSOLE_API + "/api/auth/login",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentialDetails),
          }
        )

        if (!resp.ok) {
          const response = await resp.json()
          throw new Error(response.detail)
        } else {
          const response = await resp.json()

          return {
            // ...user,
            ...response.user,
            name: "",
            accessToken: response.access,
            refreshToken: response.refresh,
          }
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
