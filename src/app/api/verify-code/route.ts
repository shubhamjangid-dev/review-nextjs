import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, verificationCode } = await request.json();

    const decodedUsername = decodeURIComponent(username); // decode krlo username ko.ex space ki jagah %20 na ho

    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user doesn't exist",
        },
        {
          status: 400,
        }
      );
    }

    if (user.isVerified) {
      return Response.json(
        {
          success: true,
          message: "User is Already verified",
        },
        {
          status: 200,
        }
      );
    }

    if (user.verificationCodeExpiry > new Date()) {
      if (user.verificationCode === verificationCode) {
        // now user is verified
        user.isVerified = true;
        await user.save();

        return Response.json(
          {
            success: true,
            message: "Account verified successfully",
          },
          {
            status: 200,
          }
        );
      } else {
        return Response.json(
          {
            success: false,
            message: "Incorrect verification code",
          },
          {
            status: 400,
          }
        );
      }
    } else {
      return Response.json(
        {
          success: false,
          message: "Verification code is expired",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("ERROR :: Verifying user using verification code ::", error);
    return Response.json(
      {
        success: false,
        message: "error occured while verifying user",
      },
      {
        status: 500,
      }
    );
  }
}
