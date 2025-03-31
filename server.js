require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./_config');

// Initialize app
const app = express();

// =============================================
// MONGODB CONNECTION (FIXED FOR RENDER)
// =============================================
const getMongoURI = () => {
  // Use Render's env var if available, otherwise fallback to config
  const uri = process.env.MONGODB_URI || config.mongoURI[app.settings.env];
  
  // Convert to SRV format if using standard connection string
  return uri.startsWith('mongodb://') 
    ? uri.replace('mongodb://', 'mongodb+srv://') 
    : uri;
};

mongoose.connect(getMongoURI(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
})
.then(() => {
  const dbHost = mongoose.connection.host;
  console.log(`✅ Connected to MongoDB cluster: ${dbHost}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1); // Exit if DB connection fails
});

// =============================================
// MIDDLEWARE & ROUTES
// =============================================
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Import routes
app.use('/', require('./routes/index'));
app.use('/image', require('./routes/image'));

// =============================================
// RENDER-SPECIFIC CONFIGURATION
// =============================================
// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Critical for Render

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;