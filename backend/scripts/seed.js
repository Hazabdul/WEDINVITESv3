import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Invitation from '../src/models/Invitation.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding_invites');
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await User.deleteMany({});
    await Invitation.deleteMany({});

    // 2. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    });
    console.log('Admin user seeded');

    // 3. Create Sample Invitation
    await Invitation.create({
      brideName: 'Alice',
      groomName: 'Bob',
      status: 'PUBLISHED',
      slug: 'alice-and-bob',
      package: 'PREMIUM',
      paymentStatus: 'PAID',
      couple: {
        bride: { name: 'Alice Smith', bio: 'The bride' },
        groom: { name: 'Bob Jones', bio: 'The groom' },
        title: 'Alice & Bob Tie the Knot'
      },
      content: {
        welcomeHeading: 'Welcome to our Wedding!',
        introMessage: 'We are getting married!',
        invitationText: 'Please join us for our special day.',
      },
      theme: {
        primaryColor: '#D4AF37',
        font: 'Playfair Display'
      },
      events: [
        {
          name: 'Wedding Ceremony',
          date: '2026-06-20',
          time: '10:00 AM',
          venue: 'The Grand Cathedral',
          address: '123 Church St, Cityville'
        },
        {
          name: 'Reception',
          date: '2026-06-20',
          time: '06:00 PM',
          venue: 'Sunset Plaza Hotel',
          address: '456 Party Rd, Beachview'
        }
      ]
    });
    console.log('Sample invitation seeded');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
