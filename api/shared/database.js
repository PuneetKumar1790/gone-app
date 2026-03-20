const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

/**
 * Get MongoDB client and database instance (connection pooling)
 * @returns {Promise<{client: MongoClient, db: import('mongodb').Db}>}
 */
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Connection URI format:", uri.split("@")[1]); // Log without credentials
    throw error;
  }
}

/**
 * Get the users collection
 * @returns {Promise<import('mongodb').Collection>}
 */
async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection("users");
}

module.exports = {
  connectToDatabase,
  getUsersCollection,
};
