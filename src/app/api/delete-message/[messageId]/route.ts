import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  await dbConnect();
  const messageId = params.messageId;
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
    const User = await UserModel.updateOne({ _id: userId }, { $pull: { messages: { _id: messageId } } });
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
