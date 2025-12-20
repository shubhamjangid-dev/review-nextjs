import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
      async authorize(credentials?: { identifier: string; password: string }): Promise<any> {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const { identifier, password } = credentials;

        await dbConnect();

        try {
          // TODO: log credentials
          const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          });

          if (!user) {
            throw new Error("No user found with this credentials");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before signin");
          }

          const isPasswordCorrect = await bcrypt.compare(password, user.password);

          if (!isPasswordCorrect) {
            throw new Error("Incorrect Password");
          }
          return {
            _id: user._id as string,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
          };
        } catch (error: unknown) {
          console.error("Authentication error:", error);
          throw error instanceof Error ? error : new Error("Authentication failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "google") {
        await dbConnect();

        try {
          const existingUserByEmail = await UserModel.findOne({ email: user.email });

          if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
              user._id = existingUserByEmail._id as string;
              user.username = existingUserByEmail.username;
              user.isVerified = existingUserByEmail.isVerified;

              return true;
            } else {
              existingUserByEmail.isVerified = true;
              existingUserByEmail.username = user.email?.split("@")[0] + "" + Math.floor(Math.random() * 1000);

              await existingUserByEmail.save();

              user._id = existingUserByEmail._id as string;
              user.username = existingUserByEmail.username;
              user.isVerified = true;

              return true;
            }
          } else {
            const hashedPassword = await bcrypt.hash("fff", 10);
            const username = user.email?.split("@")[0] + "" + Math.floor(Math.random() * 1000);

            const newCreatedUser = await UserModel.create({ email: user.email, username, password: hashedPassword, isVerified: true });

            if (!newCreatedUser) {
              return false;
            }

            user._id = newCreatedUser._id as string;
            user.username = newCreatedUser.username;
            user.isVerified = true;
            return true;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
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
