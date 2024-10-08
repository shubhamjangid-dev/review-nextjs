import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schamas/signUpScheam";
import { z } from "zod";

const UsernameQuerySchame = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    // http://localhost:3000/check-username-unique?username=shubham@123?anyother=kuchbhi
    const queryParam = {
      username: searchParams.get("username"),
    };

    // Validate Username using Zod
    const result = UsernameQuerySchame.safeParse(queryParam);

    // console.log(result); // TODO:

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid Query parameter",
          //   message: "Invalid Useraname Query parameter",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existingVerifiedUsername = await UserModel.findOne({ username, isVerified: true });

    if (existingVerifiedUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "Username is available",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("ERROR :: checking username ::", error);
    return Response.json(
      {
        success: false,
        message: "error occured while checking username",
      },
      {
        status: 500,
      }
    );
  }
}
