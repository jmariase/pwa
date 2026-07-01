import express from 'express';

const app = express();
app.use(express.json());

// Enable CORS so the PWA can fetch backend data
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    database: "connected",
    timestamp: new Date()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    service: "Port PWA Backend API",
    version: "1.0.0",
    uptime: process.uptime(),
    status: "healthy",
    environment: process.env.NODE_ENV || "development"
  });
});

export default app;

// Only start the server when run directly, not when running tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Express API Server running on port ${PORT}`);
  });
}
