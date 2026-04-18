import mongoose from 'mongoose';
import dns from 'dns';

// Use public DNS resolvers when the local DNS server rejects SRV queries.
// This fixes Atlas `mongodb+srv` resolution issues on some Windows networks.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      global.DB_CONNECTED = true;
    } else {
      console.log('No MongoDB URI configured. Using development in-memory fallback.');
      global.DB_CONNECTED = false;
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('Falling back to development in-memory store.');
    global.DB_CONNECTED = false;
  }
};

export default connectDB;
