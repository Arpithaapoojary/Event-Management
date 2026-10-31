const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// First & Last names for realistic campus student registrations
const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Karthik', 'Pooja',
  'Vikram', 'Divya', 'Siddharth', 'Meera', 'Varun', 'Neha', 'Gautam', 'Isha',
  'Arjun', 'Tanvi', 'Rahul', 'Shreya', 'Nikhil', 'Rhea', 'Manish', 'Kavya',
  'Sanjay', 'Deepa', 'Abhishek', 'Swati', 'Harsh', 'Anjali', 'Kiran', 'Vidya',
  'Akash', 'Shruti', 'Vishal', 'Payal', 'Pranav', 'Nandini', 'Suraj', 'Preeti',
  'Rajat', 'Bhavna', 'Chetan', 'Lavanya', 'Darshan', 'Rashmi', 'Manoj', 'Archana'
];

const LAST_NAMES = [
  'Sharma', 'Rao', 'Kulkarni', 'Nair', 'Shetty', 'Patil', 'Bhat', 'Deshmukh',
  'Shenoy', 'Verma', 'Menon', 'Pai', 'Reddy', 'Hegde', 'Joshi', 'Gupta',
  'Kamath', 'Mishra', 'Prabhu', 'Chauhan', 'Iyer', 'Acharya', 'Malhotra', 'Poojary',
  'Bhandary', 'Naik', 'Kashyap', 'Chopra', 'Saxena', 'Kumar', 'Singh', 'Dubey'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhoneNumber(index) {
  // Generates valid 10-digit Indian mobile number starting with 9 or 8 or 7
  const prefixes = ['98', '97', '99', '89', '88', '70', '96', '95', '81', '78'];
  const prefix = prefixes[index % prefixes.length];
  const suffix = String(10000000 + (index * 9973) % 90000000).slice(0, 8);
  return `${prefix}${suffix}`;
}

const eventsToSeed = [
  // ================= CULTURAL EVENTS (3) =================
  {
    title: 'Nritya Sandhya: Classical & Folk Dance Showcase',
    description:
      'Witness breathtaking Bharatanatyam, Kathak, and traditional folk dance performances by talented college troupes competing for the coveted Natraj Trophy. Vibrant costumes and authentic cultural expression.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 days from now
    venue: 'Main Campus Auditorium',
    capacity: 100,
    targetRegistrations: 42, // Scenario: Active & Popular
    imageUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Swaralaya: Battle of the Campus Bands & Music Fusion',
    description:
      'High-octane musical showdown featuring acoustic vocals, rock bands, and Indian classical fusion ensembles across universities. Live stage lighting, professional audio engineering, and cash awards.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 7 days from now
    venue: 'Open Air Amphitheatre',
    capacity: 60,
    targetRegistrations: 55, // Scenario: Filling Fast (Only 5 seats left!)
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Vogue Aura: Annual Ethnic Runway & Couture Gala',
    description:
      'The premier collegiate fashion pageant celebrating vibrant traditional Indian textiles, handlooms, and contemporary ethnic couture crafted and modeled by student designers on the campus runway.',
    category: 'Cultural',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // 10 days from now
    venue: 'Grand Stage & Convention Hall',
    capacity: 80,
    targetRegistrations: 18, // Scenario: Open to all, steady entry
    imageUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
  },

  // ================= TECHNICAL EVENTS (3) =================
  {
    title: 'HackNova 2026: 24-Hour Campus Hackathon',
    description:
      'Join developers, designers, and innovators for an intense 24-hour sprint. Build real-world solutions in AI, Web3, and GreenTech with high-speed networking, expert mentorship, and project awards.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 5 days from now
    venue: 'Innovation Lab & Tech Park Block A',
    capacity: 120,
    targetRegistrations: 85, // Scenario: High turnout & active
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'CodeSprint: Speed Algorithm & Data Structure Championship',
    description:
      'Competitive programming sprint solving complex algorithmic puzzles, graph theory, and optimization problems under timed rounds on standard judge platforms with instant leaderboards.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 8 days from now
    venue: 'Turing Computer Science Advanced Lab 3',
    capacity: 40,
    targetRegistrations: 40, // Scenario: FULL CAPACITY / SOLD OUT (40/40)
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'RoboWars & Autonomous Drone Arena',
    description:
      'Custom combat bot showdowns and precision obstacle-course drone racing. Engineered and programmed live by undergraduate robotics enthusiasts across colleges.',
    category: 'Technical',
    dateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 11 days from now
    venue: 'Indoor Robotics Arena (Ground Floor)',
    capacity: 75,
    targetRegistrations: 32, // Scenario: Active engineering event
    imageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },

  // ================= SPORTS EVENTS (3) =================
  {
    title: 'Premier Campus Cricket Championship 2026',
    description:
      '10-over floodlit tournament featuring inter-college cricket teams competing in group knockouts, semifinal clashes, and the grand championship trophy under stadium lights.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 6 days from now
    venue: 'University Cricket Stadium Ground',
    capacity: 50,
    targetRegistrations: 46, // Scenario: Filling Fast (Only 4 seats left!)
    imageUrl:
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Inter-College Football & Futsal Cup',
    description:
      'Fast-paced knockout football tournament with skilled campus strikers, defenders, and goalkeepers battling for the annual collegiate title on FIFA-standard turf.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 9 days from now
    venue: 'South Campus FIFA Turf Field',
    capacity: 90,
    targetRegistrations: 52, // Scenario: Popular sports cup
    imageUrl:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Athletics Track & Field Invitational 2026',
    description:
      '100m sprint heats, 4x100m relays, long jump, and track athletics showcasing college athletes pushing their speed, power, and agility in official medal rounds.',
    category: 'Sports',
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 14 days from now
    venue: 'Olympic Synthetic Track Stadium',
    capacity: 100,
    targetRegistrations: 8, // Scenario: Freshly opened / early bird registrations
    imageUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
];

async function seedCleanDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    console.log('🗑️ Step 1: Deleting ALL existing events and registrations...');
    const deletedRegistrations = await Registration.deleteMany({});
    const deletedEvents = await Event.deleteMany({});
    console.log(
      `   Removed ${deletedEvents.deletedCount} events and ${deletedRegistrations.deletedCount} registrations.`
    );

    console.log('\n✨ Step 2: Creating 9 balanced events (3 Cultural, 3 Technical, 3 Sports)...');

    let globalRegIndex = 1;
    let totalCreatedRegistrations = 0;

    for (const item of eventsToSeed) {
      const { targetRegistrations, ...eventData } = item;

      // Create Event document
      const createdEvent = await Event.create({
        ...eventData,
        registeredCount: targetRegistrations,
      });

      console.log(
        `   [${createdEvent.category.padEnd(9)}] ${createdEvent.title.padEnd(55)} | Cap: ${createdEvent.capacity} | Regs: ${targetRegistrations}`
      );

      // Generate actual Registration documents for this event
      const registrationsToInsert = [];
      const usedEmails = new Set();

      for (let i = 0; i < targetRegistrations; i++) {
        const first = getRandomItem(FIRST_NAMES);
        const last = getRandomItem(LAST_NAMES);
        const fullName = `${first} ${last}`;

        let email = `${first.toLowerCase()}.${last.toLowerCase()}${globalRegIndex}@campus.edu`;
        if (usedEmails.has(email)) {
          email = `${first.toLowerCase()}.${last.toLowerCase()}.${Date.now().toString().slice(-4)}${i}@student.edu`;
        }
        usedEmails.add(email);

        const contactNumber = generatePhoneNumber(globalRegIndex);

        // Spread registrations across past 48 hours
        const registrationTime = new Date(
          Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000)
        );

        registrationsToInsert.push({
          event: createdEvent._id,
          fullName,
          email,
          contactNumber,
          createdAt: registrationTime,
          updatedAt: registrationTime,
        });

        globalRegIndex++;
      }

      if (registrationsToInsert.length > 0) {
        await Registration.insertMany(registrationsToInsert);
        totalCreatedRegistrations += registrationsToInsert.length;
      }
    }

    console.log('\n✅ Step 3: Verification & Summary:');
    const finalEventCount = await Event.countDocuments({ isDeleted: false });
    const finalRegCount = await Registration.countDocuments();
    const culturalCount = await Event.countDocuments({ category: 'Cultural' });
    const technicalCount = await Event.countDocuments({ category: 'Technical' });
    const sportsCount = await Event.countDocuments({ category: 'Sports' });
    const fullEventsCount = await Event.countDocuments({
      $expr: { $gte: ['$registeredCount', '$capacity'] },
    });

    console.log(`   Total Events: ${finalEventCount}`);
    console.log(`   - Cultural: ${culturalCount}`);
    console.log(`   - Technical: ${technicalCount}`);
    console.log(`   - Sports: ${sportsCount}`);
    console.log(`   - Full Capacity Events: ${fullEventsCount}`);
    console.log(`   Total Real Registrations in Database: ${finalRegCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

seedCleanDatabase();
