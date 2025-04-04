import { Collection, Message } from "@/model/Collection.model";
import { Date } from "mongoose";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
  collectionName?: string;
  link?: string;
  collections?: Array<Collection>;
  expiryOfCode?: Date;
  isVerified?: boolean;
}
