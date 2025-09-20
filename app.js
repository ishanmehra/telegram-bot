require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const cron = require('node-cron');

// Import modules
const User = require('./models/User');
const JokeService = require('./services/JokeService');
const BotHandlers = require('./handlers/BotHandlers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('MongoDB connection error:', error));

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Initialize services
const jokeService = new JokeService();
const botHandlers = new BotHandlers(bot, jokeService);

// Set up bot commands
botHandlers.setupCommands();

// Schedule job to send jokes every minute to check for users who need jokes
cron.schedule('* * * * *', async () => {
  try {
    await botHandlers.sendScheduledJokes();
  } catch (error) {
    console.error('Error in scheduled joke delivery:', error);
  }
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Bot is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Application error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Telegram bot is active and listening for messages');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  bot.stopPolling();
  mongoose.connection.close();
  process.exit(0);
});