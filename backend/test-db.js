import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers to public ones to resolve SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

const uri = process.env.MONGODB_URI || 'mongodb+srv://hazeebzdco_db_user:NoKD8JNIJEXXhEkj@clusterwedinivites.lwfvxhd.mongodb.net/wedding_invites?retryWrites=true&w=majority';

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', uri.replace(/:([^:@]{4})[^:@]*@/, ':****@')); // Hide password

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  return mongoose.connection.close();
})
.catch(err => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error:', err.message);
  if (err.message.includes('authentication failed')) {
    console.log('\n🔧 Authentication failed. Please check:');
    console.log('1. Database user exists in Atlas');
    console.log('2. Username and password are correct');
    console.log('3. User has access to "wedding_invites" database');
    console.log('4. User has "Read and write" permissions');
  }
  process.exit(1);
});