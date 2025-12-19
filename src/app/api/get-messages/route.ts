import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";
import { CollectionModel } from "@/model/Collection.model";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId");

  if (!collectionId) {
    return Response.json(
      {
        success: false,
        message: "CollectionId not found",
      },
      {
        status: 400,
      }
    );
  }
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
  const userId = new mongoose.Types.ObjectId(user?._id);
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

    // const collectionMessages = await CollectionModel.aggregate([
    //   {
    //     $match: {
    //       _id: new mongoose.Types.ObjectId(collectionId),
    //     },
    //   },
    //   {
    //     $unwind: "$messages",
    //     // preserveNullAndEmptyArrays: true, // preserve
    //   },
    //   {
    //     $sort: {
    //       "messages.createdAt": -1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       collectionName: { $first: "$collectionName" },
    //       messages: {
    //         $push: "$messages",
    //       },
    //     },
    //   },
    // ]);
    //

    const collectionMessages = await CollectionModel.findOne({ _id: new mongoose.Types.ObjectId(collectionId) });

    if (!collectionMessages) {
      return Response.json(
        {
          success: false,
          message: "Messages not found 1",
        },
        {
          status: 400,
        }
      );
    }

    // update last accessed
    await CollectionModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(collectionId) },
      { $set: { lastAccessed: Date.now() } }
    );

    return Response.json(
      {
        success: true,
        collectionName: collectionMessages.collectionName,
        messages: collectionMessages.messages,
        link: collectionMessages.messageAcceptingLink,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ERROR :: Failed while getting messages ::", error);
    return Response.json(
      {
        success: false,
        message: "error occured while getting messages",
      },
      {
        status: 500,
      }
    );
  }
}
