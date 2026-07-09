import mongoose from 'mongoose';

export const connectDB = async () => {
  if (process.env.USE_MOCK === 'true') {
    console.log('MongoDB: Running in Mock Mode (In-Memory Array Store)');
    return;
  }
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/coffee';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
