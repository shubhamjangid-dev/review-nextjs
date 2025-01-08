import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose, { Collection } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { CollectionModel } from "@/model/Collection.model";

export async function POST(request: Request) {
  const { collectionId } = await request.json();
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

    const currCollection = await CollectionModel.findByIdAndUpdate(collectionId, { messageAcceptingLink: Math.random().toString(36).substring(2, 15) });

    if (!currCollection) {
      return Response.json(
        {
          success: false,
          message: "Failed to generate new link in collection",
        },
        {
          status: 501,
        }
      );
    }
    const updatedCollection = await CollectionModel.findById(collectionId);
    if (!updatedCollection) {
      return Response.json(
        {
          success: false,
          message: "collection link not updated properly",
        },
        {
          status: 501,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "New link generated successfully",
        link: updatedCollection.messageAcceptingLink,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error :: Failed to generate new link ::", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate new link",
      },
      {
        status: 501,
      }
    );
  }
}
