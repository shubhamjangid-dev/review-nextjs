import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import UserModel from "@/model/User.model";
import dbConnect from "@/lib/dbConnect";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email Or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          // TODO: log credentials
          const user = await UserModel.findOne({
            $or: [{ email: credentials.identifier.identifier }, { username: credentials.identifier.identifier }],
          });

          if (!user) {
            throw new Error("No user found with this credentials");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before signin");
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.identifier.password, user.password);

          if (!isPasswordCorrect) {
            throw new Error("Incorrect Password");
          }
          return user;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
    // ye user aaya h providers me se jaha apne password compare kiya tha uske baad return user kiya tha waha se
    async jwt({ token, user }) {
      // first declare user in types/next-auth.ds.t
      // because you cannot acess user proverty here
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET_KEY,
};
