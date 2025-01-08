import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import UserModel from "@/model/User.model";
import { CollectionModel } from "@/model/Collection.model";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

type reqParams = { params: { collectionId: string } };

export async function DELETE(request: Request, { params }: reqParams) {
  const resolvedParams = await params; // Resolve the Promise
  const { collectionId } = resolvedParams;

  await dbConnect();
  const session = await getServerSession(authOptions);

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
  const userId = session.user._id;

  try {
    const currUser = await UserModel.updateOne({ _id: userId }, { $pull: { collections: new mongoose.Types.ObjectId(collectionId) } });
    if (!currUser) {
      return Response.json(
        {
          success: false,
          message: "Collection not belongs to user",
        },
        {
          status: 401,
        }
      );
    }
    const updatedCollection = await CollectionModel.findByIdAndDelete(collectionId);

    if (!updatedCollection) {
      return Response.json(
        {
          success: false,
          message: "Collection not found or already deleted",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Collection deleted successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("ERROR : Failed to delete collection ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete collection",
      },
      {
        status: 501,
      }
    );
  }
}
