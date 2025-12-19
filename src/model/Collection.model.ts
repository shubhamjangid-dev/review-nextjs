import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface Collection extends Document {
  collectionName: string;
  messageAcceptingLink: string;
  isAcceptingMessages: boolean;
  messages: Message[];
  lastAccessed:Date;
}

const CollectionSchema: Schema<Collection> = new Schema({
  collectionName: {
    type: String,
    required: [true, "Collection name is required"],
  },
  messageAcceptingLink: {
    type: String,
    unique: true,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

const CollectionModel = (mongoose.models.Collection as mongoose.Model<Collection>) || mongoose.model<Collection>("Collection", CollectionSchema);

export { CollectionSchema, CollectionModel };
