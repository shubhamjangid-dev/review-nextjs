import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { CollectionModel } from "@/model/Collection.model";

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
    const { isAcceptingMessages, collectionId } = await request.json();

    const currUser = await UserModel.findOne({ _id: userId, collections: collectionId });
    if (!currUser) {
      return Response.json(
        {
          success: false,
          message: "Collection does not belong to the user",
        },
        {
          status: 401,
        }
      );
    }

    const updatedCollection = await CollectionModel.findByIdAndUpdate(collectionId, { $set: { isAcceptingMessages } }, { new: true });

    if (!updatedCollection) {
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
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId");
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
    const currUser = await UserModel.findOne({ _id: userId, collections: collectionId });
    if (!currUser) {
      return Response.json(
        {
          success: false,
          message: "Collection does not belong to the user",
        },
        {
          status: 401,
        }
      );
    }

    const currCollection = await CollectionModel.findById(collectionId);

    if (!currCollection) {
      return Response.json(
        {
          success: false,
          message: "Collection not found",
        },
        {
          status: 200,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "isAcceptingMessages fetched successfully",
        isAcceptingMessages: currCollection.isAcceptingMessages,
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
