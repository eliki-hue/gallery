const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./_config');

// Define routes
let index = require('./routes/index');
let image = require('./routes/image');

// Initializing the app
const app = express();

// Database connection with improved error handling
const MONGODB_URI = process.env.MONGODB_URI || config.mongoURI[app.settings.env];

// Updated MongoDB connection with modern settings
mongoose.connect(MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000 // Close sockets after 45s of inactivity
})
.then(() => console.log(`Connected to Database: ${MONGODB_URI.split('@')[1]}`)) // Hide credentials in logs
.catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1); // Exit if DB connection fails
});

// View Engine
app.set('view engine', 'ejs');

// Set up the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.json());

// Routes
app.use('/', index);
app.use('/image', image);

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Server configuration for Render
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Critical for Render

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

module.exports = app;