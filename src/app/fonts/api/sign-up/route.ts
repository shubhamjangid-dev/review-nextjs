import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";

async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exist",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email is already registered",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCodeExpiry = new Date();

        verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 5); // expires after 5 minutes  or 300 sec

        // update user
        existingUserByEmail.username = username;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = verificationCodeExpiry;

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationCodeExpiry = new Date();

      verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 5); // expires after 5 minutes  or 300 sec
      const createdUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpiry,
        isVerified: false,
        messages: [],
        isAcceptingMessages: true,
      });

      await createdUser.save();
    }

    // send Verification Code to user in Email
    // send Verification Email

    const emailReaponse = await sendVerificationEmail(username, email, verificationCode);

    // TODO: log emailResponse to check what it returnes

    if (!emailReaponse.success) {
      return Response.json(
        {
          success: false,
          message: emailReaponse.message || "ERROR :: Send Verification Email Failed",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        // message :"User Registered Successfully and verify your email using verification code",
        message: "User Registered Successfully and verification code is sent to your email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("ERROR :: Registering User ::", error);
    return Response.json(
      {
        success: false,
        message: "Registering User Failed",
      },
      {
        status: 500,
      }
    );
  }
}
