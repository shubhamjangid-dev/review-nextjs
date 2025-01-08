import { Collection, Message } from "@/model/Collection.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
  collectionName?: string;
  link?: string;
  collections?: Array<Collection>;
}
