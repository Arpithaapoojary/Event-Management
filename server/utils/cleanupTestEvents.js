const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

const cleanupTestEvents = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';
    await mongoose.connect(mongoUri);

    // Delete test junk records
    const result = await Event.deleteMany({
      $or: [
        { title: { $in: ['Song', 'Animal', 'ssssssssssssssssss'] } },
        { description: { $in: ['Song', 'hellooooo', 'jjjjjjjjjjjjjj'] } },
      ],
    });

    console.log(`Cleaned up ${result.deletedCount} placeholder test records.`);

    // If fewer than 7 realistic events exist, add high-quality realistic ones
    const count = await Event.countDocuments({ isDeleted: false });
    console.log(`Current active events count: ${count}`);

    if (count < 6) {
      const extraEvents = [
        {
          title: 'Vogue Aura: Annual Ethnic Couture Fashion Walk',
          description: 'The premier collegiate fashion pageant celebrating vibrant traditional Indian textiles, handlooms, and contemporary ethnic couture crafted and modeled by student designers on the campus runway.',
          category: 'Cultural',
          dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
          venue: 'Grand Stage & Convention Hall',
          capacity: 250,
          registeredCount: 140,
          imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: 'CodeSprint: Speed Algorithm & Data Structure Championship',
          description: 'Competitive programming speed sprint solving complex algorithms, graph theory, and optimization problems under timed rounds on standard judge platforms.',
          category: 'Technical',
          dateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
          venue: 'Computer Science Advanced Lab 4',
          capacity: 80,
          registeredCount: 80,
          imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        },
      ];
      await Event.insertMany(extraEvents);
      console.log('Added realistic supplementary campus events.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err.message);
    process.exit(1);
  }
};

cleanupTestEvents();
