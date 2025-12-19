import dbConnect from "@/lib/dbConnect";
import { CollectionModel, Message } from "@/model/Collection.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {link, messageContent } = await request.json();

    const collection = await CollectionModel.findOne({ messageAcceptingLink: link });

    if (!collection) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired link ",
        },
        {
          status: 404,
        }
      );
    }

    if (!collection.isAcceptingMessages) {
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

    collection.messages.push(newMessage as Message);
    await collection.save();

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
