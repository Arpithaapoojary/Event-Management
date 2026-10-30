const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

const sampleEvents = [
  // ================= CULTURAL EVENTS (3) =================
  {
    title: 'Nritya Sandhya: Classical & Folk Dance Showcase',
    description: 'Witness breathtaking Bharatanatyam, Kathak, and traditional folk dance performances by talented college troupes competing for the coveted Natraj Trophy. Vibrant costumes and authentic cultural expression.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 days from now
    venue: 'Main Campus Auditorium',
    capacity: 350,
    registeredCount: 180,
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Swaralaya: Battle of the Campus Bands & Music Fusion',
    description: 'High-octane musical showdown featuring acoustic vocals, rock bands, and Indian classical fusion ensembles across universities. Live stage lighting, professional audio engineering, and cash awards.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 7 days from now
    venue: 'Open Air Amphitheatre',
    capacity: 500,
    registeredCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Vogue Aura: Annual Ethnic Couture Fashion Walk',
    description: 'The premier collegiate fashion pageant celebrating vibrant traditional Indian textiles, handlooms, and contemporary ethnic couture crafted and modeled by student designers on the campus runway.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // 10 days from now
    venue: 'Grand Stage & Convention Hall',
    capacity: 250,
    registeredCount: 140,
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
  },

  // ================= TECHNICAL EVENTS (3) =================
  {
    title: 'HackNova 2026: 24-Hour Campus Hackathon',
    description: 'Join over 200 developers, designers, and innovators for an intense 24-hour hackathon. Build real-world solutions in AI, Web3, and GreenTech. High-speed network, mentorship, and project awards.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 5 days from now
    venue: 'Innovation Lab & Tech Park Block A',
    capacity: 120,
    registeredCount: 75,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'RoboWars & Autonomous Drone Arena',
    description: 'Custom combat bot showdowns and precision obstacle-course drone racing. Engineered and programmed live by undergraduate robotics enthusiasts across colleges.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 8 days from now
    venue: 'Indoor Robotics Arena (Ground Floor)',
    capacity: 200,
    registeredCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'CodeSprint: Speed Algorithm & Data Structure Championship',
    description: 'Competitive programming speed sprint solving complex algorithms, graph theory, and optimization problems under timed rounds on standard judge platforms.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 11 days from now
    venue: 'Computer Science Advanced Lab 4',
    capacity: 80,
    registeredCount: 80, // Sold out / full capacity demonstration
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  },

  // ================= SPORTS EVENTS (3) =================
  {
    title: 'Premier Campus Cricket Championship 2026',
    description: '10-over floodlit tournament featuring inter-college cricket teams competing in group knockouts, semifinal clashes, and the grand championship trophy.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 6 days from now
    venue: 'University Cricket Ground',
    capacity: 300,
    registeredCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Inter-College Football & Futsal Cup',
    description: 'Fast-paced knockout football tournament with skilled campus strikers, defenders, and goalkeepers battling for the annual collegiate title on FIFA-standard turf.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 12 days from now
    venue: 'South Campus Turf Field',
    capacity: 250,
    registeredCount: 160,
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Athletics Track & Field Invitational 2026',
    description: '100m sprint heats, 4x100m relays, long jump, and track athletics showcasing college athletes pushing their speed, power, and agility in official medal rounds.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 14 days from now
    venue: 'Olympic Synthetic Track Stadium',
    capacity: 400,
    registeredCount: 280,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing old sample events...');
    await Event.deleteMany({});

    console.log('Inserting fresh sample events for Cultural, Technical, and Sports...');
    const inserted = await Event.insertMany(sampleEvents);
    console.log(`✅ Successfully seeded ${inserted.length} fresh sub-events!`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
