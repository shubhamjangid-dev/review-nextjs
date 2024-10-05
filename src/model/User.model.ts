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

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  messages: Message[];
  isAcceptingMessages: boolean;
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please provide valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verificationCode: {
    type: String,
    required: [true, "Verification Code is required"],
  },
  verificationCodeExpiry: {
    type: Date,
    required: [true, "Verification Code Expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  messages: [MessageSchema],
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;
