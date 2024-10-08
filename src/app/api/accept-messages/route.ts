import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user?._id;

  try {
    const { isAcceptingMessages } = await request.json();

    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
      isAcceptingMessages,
    });
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "mongoDB failed to update isAccespingMessages ",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "isAccespingMessages is updated successfully",
        updatedUser,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("ERROR : Failed to update isAcceptingMessages ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update isAcceptingMessages",
      },
      {
        status: 501,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user?._id;
  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "isAcceptingMessages fetched successfully",
        isAcceptingMessages: user.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("ERROR :: Failed to get isAcceptingMessages info ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get isAcceptingMessages info",
      },
      {
        status: 500,
      }
    );
  }
}
