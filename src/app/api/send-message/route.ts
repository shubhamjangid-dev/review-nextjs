import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { Message } from "@/model/User.model";

export async function POST(request: Response) {
  await dbConnect();

  try {
    const { username, messageContent } = await request.json();

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User disabled accepting messages",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = {
      content: messageContent,
      createdAt: new Date(),
    };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent and stored successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ERROR :: Failed while send message ::", error);
    return Response.json(
      {
        success: false,
        message: "error occured while sending message",
      },
      {
        status: 500,
      }
    );
  }
}
