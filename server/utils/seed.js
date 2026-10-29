const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

const sampleEvents = [
  {
    title: 'HackNova: 24-Hour Campus Hackathon',
    description: 'Join over 200 developers, designers, and innovators for an intense 24-hour hackathon. Build real-world solutions in AI, Web3, and GreenTech. Mentorship, food, and prizes worth $5,000 provided!',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    venue: 'Main Auditorium & Innovation Lab (Block A)',
    capacity: 100,
    registeredCount: 42,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Generative AI & LLMs in Production Workshop',
    description: 'A hands-on technical workshop diving deep into building real-time applications with LangChain, Gemini API, and vector databases. Bring your laptop and your curiosity.',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    venue: 'Seminar Hall 2, Tech Park',
    capacity: 60,
    registeredCount: 38,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Career Connect: Tech Placement & Resume Masterclass',
    description: 'Learn directly from senior engineering leaders at top tech companies about acing system design, behavioral rounds, and resume building.',
    dateTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    venue: 'Virtual Room (Zoom) & Hall B',
    capacity: 150,
    registeredCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cybersecurity & Ethical Hacking Bootcamp (Sold Out)',
    description: 'Master practical defense strategies against modern cyber threats, penetration testing fundamentals, and zero-trust network architectures.',
    dateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    venue: 'Cyber Forensics Lab (Room 304)',
    capacity: 25,
    registeredCount: 25, // Capacity reached!
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Annual Robotics & IoT Project Expo 2026',
    description: 'The annual showcase of hardware prototypes, autonomous drones, and embedded systems created by undergraduate engineering cohorts.',
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (PAST)
    venue: 'Indoor Sports Arena',
    capacity: 300,
    registeredCount: 280,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Full-Stack Web Engineering with React & Node',
    description: 'A beginner-to-intermediate crash course on structuring modern full-stack web applications, REST APIs, and database transactions.',
    dateTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (PAST)
    venue: 'Computer Science Lab 3',
    capacity: 50,
    registeredCount: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing old sample events...');
    await Event.deleteMany({});

    console.log('Inserting fresh sample events...');
    const inserted = await Event.insertMany(sampleEvents);
    console.log(`✅ Successfully seeded ${inserted.length} events!`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
