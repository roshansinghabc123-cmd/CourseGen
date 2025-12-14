const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    try {
      if (mongoURI && mongoURI !== 'mongodb://localhost:27017/text-to-learn') {
        // If a specific URI is provided (not default), try it first
        await mongoose.connect(mongoURI, options);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      } else {
        throw new Error('Default or missing URI');
      }
    } catch (err) {
      console.log('Falling back to In-Memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log('In-Memory MongoDB URI:', uri);

      await mongoose.connect(uri, options);
      console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdwn
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(' MongoDB connection failed FATALLY:', error.message);
    // Do not exit, keep server alive even if DB fails
    // process.exit(1); 
  }
};

module.exports = connectDB;
