import mongoose from 'mongoose';
import dns from 'dns';

// Use public DNS resolvers when the local DNS server rejects SRV queries.
// This fixes Atlas `mongodb+srv` resolution issues on some Windows networks.
dns.setServers(['1.1.1.1', '8.8.8.8']);
mongoose.set('bufferCommands', false);

let connectionPromise = null;
const isDevelopment = process.env.NODE_ENV === 'development';

const useInMemoryFallback = () => isDevelopment && (global.USE_IN_MEMORY_DB === true || !process.env.MONGODB_URI?.trim());

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    global.DB_CONNECTED = true;
    global.USE_IN_MEMORY_DB = false;
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI?.trim();

  if (useInMemoryFallback()) {
    console.log('Using development in-memory fallback storage.');
    global.DB_CONNECTED = false;
    global.USE_IN_MEMORY_DB = true;
    return false;
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      global.DB_CONNECTED = true;
      global.USE_IN_MEMORY_DB = false;
      return true;
    } catch (error) {
      global.DB_CONNECTED = false;
      console.error(`MongoDB connection failed: ${error.message}`);
      if (isDevelopment) {
        global.USE_IN_MEMORY_DB = true;
        console.warn('Falling back to in-memory development storage because MongoDB is unavailable.');
        return false;
      }
      throw new Error('MongoDB connection failed. Check MONGODB_URI and Atlas access before starting the backend.');
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const ensureDBReady = async () => {
  if (useInMemoryFallback()) {
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    global.DB_CONNECTED = true;
    global.USE_IN_MEMORY_DB = false;
    return true;
  }

  return connectDB();
};

export default connectDB;
