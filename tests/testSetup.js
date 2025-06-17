import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;

//Firstly we get the mongo uri from the MongoMemoryServer instance
// and then we connect to it using mongoose.
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, {});
});

// After each test, we clear the database
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// After all tests, we close the connection to the database
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
