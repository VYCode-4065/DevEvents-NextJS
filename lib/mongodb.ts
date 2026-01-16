import mongoose, { Mongoose } from "mongoose";

// Type definition for the cached connection
interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Initialize cache object on the global scope to persist across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

// Get or initialize the cache
let cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using Mongoose with caching to prevent multiple connections.
 * In development, this prevents multiple connections during hot reloads.
 * In production, this ensures a single persistent connection.
 *
 * @returns Promise that resolves to the Mongoose connection instance
 * @throws Error if MongoDB URI is not defined in environment variables
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending connection promise if it exists
  if (cached.promise) {
    return cached.promise;
  }

  // Verify MongoDB URI is configured
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. Please add it to your .env.local file."
    );
  }

  // Create new connection promise
  cached.promise = mongoose
    .connect(mongoUri, {
      // Connection pooling settings
      maxPoolSize: 10,
      minPoolSize: 5,
      // Socket timeout
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      // Cache the successful connection
      cached.conn = mongooseInstance;
      return mongooseInstance;
    })
    .catch((error: Error) => {
      // Clear the promise cache on error to allow retry
      cached.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    });

  // Return and store the connection
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Disconnect from MongoDB database.
 * Useful for cleanup in testing or shutdown scenarios.
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export default connectToDatabase;
