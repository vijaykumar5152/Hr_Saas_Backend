const cors = require('cors');
const db = require('./config/db')
const express = require('express');
const authrouter = require('./routes/authRoutes');
const jobRoutes = require("./routes/jobRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teamRoutes = require("./routes/teamRoutes");
const notesRoutes = require("./routes/notesRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
require("dotenv").config();

const app = express()

app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ], // Accept requests from any common localhost port
  credentials: true
}));

// Routes
app.use('/api/auth', authrouter)
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})