// 1. Import dependencies and config
// Loads all required libraries and configures environment variables.
const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling
const cors = require('cors'); // Enables Cross-Origin Resource Sharing
const helmet = require('helmet'); // Secures HTTP headers
const rateLimit = require('express-rate-limit'); // Limits repeated requests
const { createServer } = require('http'); // Node.js HTTP server
const { Server } = require('socket.io'); // Real-time communication
require('dotenv').config(); // Loads .env variables



// 2. Import route handlers and socket logic
// These files define how different API endpoints and sockets behave.
const authRoutes = require('./routes/auth'); // Authentication endpoints
const stockRoutes = require('./routes/stocks'); // Stock-related endpoints
const aiRoutes = require('./routes/ai'); // AI-related endpoints
const userRoutes = require('./routes/users'); // User management endpoints
const stockSocket = require('./sockets/stockSocket'); // Socket.io logic for stocks

// 3. Create Express app and HTTP/Socket.io servers
// Sets up the main Express app and attaches Socket.io for real-time features.
const app = express();
const httpServer = createServer(app); // HTTP server for Express
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow frontend
    methods: ["GET", "POST"]
  }
});

// 4. Security and CORS middleware
// Adds security headers and allows cross-origin requests from your frontend.
app.use(helmet());

// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:3000",
//   credentials: true
// }));
// After
const allowedOrigins = [
  "http://localhost:3000",
  "https://stock-analyst-chat-gpt.vercel.app"
];
app.set('trust proxy', 1); // trust first proxy

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 5. Rate limiting middleware for /api routes
// Prevents abuse by limiting the number of requests per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// 6. Body parsing middleware
// Allows Express to read JSON and URL-encoded data from requests.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 7. Connect to MongoDB
// Connects to your MongoDB database using Mongoose.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-analyst')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 8. Mount API routes
// Registers your API endpoints under /api/...
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/auth', authRoutes);    // Authentication (register, login, etc.)
app.use('/api/stocks', stockRoutes); // Stock data endpoints
app.use('/api/ai', aiRoutes);        // AI-related endpoints
app.use('/api/users', userRoutes);   // User management endpoints

// 9. Health check endpoint
// Simple endpoint to check if the API is running.
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stock Analyst API is running',
    timestamp: new Date().toISOString()
  });
});

// 10. Initialize socket.io logic
// Sets up real-time communication for stock updates.
stockSocket(io);

// 11. Error handling middleware
// Catches errors from routes and sends a JSON error response.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 12. 404 handler for unmatched routes
// Returns a 404 JSON response for any unknown route.
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 13. Start the server
// Starts the HTTP and Socket.io server on the specified port.
const PORT = process.env.PORT || 5002; // Uses .env PORT or 5002 by default
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});