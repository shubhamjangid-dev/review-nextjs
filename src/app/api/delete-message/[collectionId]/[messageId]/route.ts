import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";
import { CollectionModel } from "@/model/Collection.model";

type reqParams = { params: { messageId: string; collectionId: string } };

export async function DELETE(request: Request, { params }: reqParams) {
  const resolvedParams = await params; // Resolve the Promise
  const { messageId, collectionId } = resolvedParams;

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
    const currUser = await UserModel.findOne({ _id: userId, collections: collectionId });
    if (!currUser) {
      return Response.json(
        {
          success: false,
          message: "Message does not belong to the user",
        },
        {
          status: 401,
        }
      );
    }
    const updatedCollection = await CollectionModel.updateOne({ _id: collectionId }, { $pull: { messages: { _id: messageId } } });

    if (updatedCollection.modifiedCount === 0) {
      return Response.json(
        {
          success: true,
          message: "Message not found or already deleted",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("ERROR : Failed to delete message ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete message",
      },
      {
        status: 501,
      }
    );
  }
}
