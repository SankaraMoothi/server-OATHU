const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const connectDB = async () => {
  const connection = await mongoClient.connect(process.env.mongo_URL);
  const db = connection.db("AuthServer");

  return db;
};

const closeConnection = async () => {
  if (connection) {
    await connection.close();
  } else {
    console.log("No connection");
  }
};

module.exports = { connectDB, closeConnection };
