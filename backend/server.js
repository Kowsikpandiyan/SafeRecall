const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Route Bindings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/traceability', require('./routes/traceabilityRoutes'));
app.use('/api/recalls', require('./routes/recallRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Product Traceability, Marketplace & Recall Management Engine',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Server Port
const PORT = process.env.PORT || 2001;

app.listen(PORT, () => {
  console.log(`[Server Online]: Listening on port ${PORT}`);
});

module.exports = app;