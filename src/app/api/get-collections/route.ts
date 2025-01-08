import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose, { Collection } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

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
    const currUser = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "collections",
          foreignField: "_id",
          as: "collections",
        },
      },
      {
        $addFields: {
          collections_data: "$collections",
        },
      },
    ]);

    if (!currUser || !currUser.length) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "success",
        collections: currUser[0].collections,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error :: Failed ::", error);

    return Response.json(
      {
        success: false,
        message: "failed",
      },
      {
        status: 501,
      }
    );
  }
}
