import mongoose from 'mongoose';
import dns from 'dns';

// Use public DNS resolvers when the local DNS server rejects SRV queries.
// This fixes Atlas `mongodb+srv` resolution issues on some Windows networks.
dns.setServers(['1.1.1.1', '8.8.8.8']);
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    console.log('No MongoDB URI configured. Using development in-memory fallback.');
    global.DB_CONNECTED = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.DB_CONNECTED = true;
    return true;
  } catch (error) {
    global.DB_CONNECTED = false;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw new Error('MongoDB connection failed. Check MONGODB_URI and Atlas access before starting the backend.');
  }
};

export default connectDB;
