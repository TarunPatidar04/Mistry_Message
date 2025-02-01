import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    console.log("DB connection : ", db);

    connection.isConnected = db.connections[0].readyState;

    console.log("DB connection successful : ", connection.isConnected);

  } catch (error) {

    console.log("DB connection error:", error);
    
    process.exit();
  }
}

export default dbConnect;
