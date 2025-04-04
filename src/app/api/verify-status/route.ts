import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();

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
          isVerified: true,
        },
        {
          status: 200,
        }
      );
    }
    if (user.verificationCode) {
      return Response.json(
        {
          success: true,
          message: "user is not verified",
          expiryOfCode: user.verificationCodeExpiry,
          isVerified: false,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("ERROR :: checking verification status ::", error);
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
