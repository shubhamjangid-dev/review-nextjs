import { Message } from "@/model/Collection.model";
import { Date } from "mongoose";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
  collectionName?: string;
  link?: string;
  collections?: Array<CollectionResponse>;
  expiryOfCode?: Date;
  isVerified?: boolean;
}

export interface CollectionResponse {
  _id: string;
  collectionName: string;
  messageAcceptingLink: string;
  isAcceptingMessages: boolean;
  messageCount: number;
  unreadMessageCount: number;
}
