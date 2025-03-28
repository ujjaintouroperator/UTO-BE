const express = require('express');
const path = require('path');
const app = express();

// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the 'browser/app' folder (replace 'app' if necessary)
app.use(express.static(path.join(__dirname, 'browser', 'app')));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Example additional route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Catch-all route to serve Angular's index.html for client-side routing
// This is crucial for Angular's client-side routing to work
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'browser', 'app', 'index.html'));
});

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app; // Export the app instance