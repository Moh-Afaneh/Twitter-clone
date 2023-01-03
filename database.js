import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(process.env.DB)
      .then(() => console.log("database connection was successful"))
      .catch((err) => console.log("database connection failed " + err));
  }
}
export default new Database();
