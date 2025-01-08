import dbConnect from "@/lib/dbConnect";
import { Collection, CollectionModel } from "@/model/Collection.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();
  const { collectionName } = await request.json();

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

  const currUser = await UserModel.findById(userId);

  if (!currUser) {
    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      {
        status: 404,
      }
    );
  }
  try {
    const newCollection = new CollectionModel({
      collectionName,
      messageAcceptingLink: Math.random().toString(36).substring(2, 15),
      isAcceptingMessages: true,
      messages: [],
    });

    await newCollection.save();

    if (!newCollection) {
      return Response.json(
        {
          success: false,
          message: "Failed to create collection",
        },
        {
          status: 501,
        }
      );
    }
    currUser.collections.push(newCollection._id as mongoose.Types.ObjectId);
    await currUser.save();

    return Response.json(
      {
        success: true,
        message: "Collection created successfully",
        collection: newCollection,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("ERROR : Failed to create collection ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to create collection",
      },
      {
        status: 501,
      }
    );
  }
}
