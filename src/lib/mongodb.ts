import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Check if we're using a build-time placeholder URI
const isBuildTimePlaceholder = MONGODB_URI && MONGODB_URI.includes('placeholder:27017/build-time-db');

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Mock mongoose instance for build time
const mockMongoose = {
  connection: { readyState: 1 },
  model: (name: string) => ({
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    updateOne: () => Promise.resolve({}),
    deleteOne: () => Promise.resolve({}),
    aggregate: () => Promise.resolve([]),
    countDocuments: () => Promise.resolve(0),
    distinct: () => Promise.resolve([]),
  })
};

async function connectDB() {
  // During build time with placeholder, return a mock connection to avoid build failures
  if (isBuildTimePlaceholder) {
    console.warn('Using build-time MongoDB placeholder - returning mock connection');
    return mockMongoose;
  }

  // Runtime check - throw error if URI is missing
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
