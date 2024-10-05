import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Db Already Connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_DB_URI || "");

    connection.isConnected = db.connections[0].readyState;
    // TODO: log db
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connection Failed :", error);

    process.exit(1);
  }
}

export default dbConnect;
