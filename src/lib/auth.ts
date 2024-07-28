import { NEXTAUTH_SECRET } from "@/shared/env"
import { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [],

  secret: NEXTAUTH_SECRET,
  // debug: true,

  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin

      if (account) {
        token.id = account.providerAccountId
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token, user }: any) {
      // Send properties to the client, like an access_token from a provider.
      session.user.id = token.id
      return session
    },
  },
}

// export const signOutWithAuth0 = async () => {
//   const router = useRouter();

//   router
// }

// clientId: process.env.AUTH0_CLIENT_ID,
// clientSecret: process.env.AUTH0_CLIENT_SECRET,
// issuer: process.env.AUTH0_ISSUER
