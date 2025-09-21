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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: false
});

// Clear any existing webhook and start polling
bot.deleteWebHook()
  .then(() => {
    console.log('Starting bot polling...');
    // Verify bot token by getting bot info
    return bot.getMe();
  })
  .then((botInfo) => {
    console.log(`Bot verified: ${botInfo.first_name} (@${botInfo.username})`);
    return bot.startPolling({
      interval: 1000,
      params: {
        timeout: 30
      }
    });
  })
  .then(() => {
    console.log('Bot polling started successfully');
  })
  .catch((error) => {
    console.error('Failed to start bot:', error.message);
    if (error.code === 'EFATAL' || error.response?.statusCode === 401) {
      console.error('Invalid bot token. Please check your TELEGRAM_BOT_TOKEN in .env file');
    }
  });

// Handle polling errors gracefully
bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    console.log('Polling conflict detected.');
  } else if (error.code === 'EFATAL') {
    console.error('Fatal polling error:', error.message);
    console.error('This usually indicates an invalid bot token or network issue');
    console.error('Please check your TELEGRAM_BOT_TOKEN in .env file');
  } else {
    console.log('Polling error:', error.code, '-', error.message);
  }
});

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
app.get('/', (req, res) => {
  res.json({
    status: 'Telegram Joke Bot is running',
    message: 'Bot is active and sending jokes',
    endpoints: {
      health: '/health',
      users: '/api/users'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Bot is running', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

// API endpoint to check users (for monitoring)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { chatId: 1, isEnabled: 1, frequency: 1, lastSentAt: 1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Application error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Telegram bot is active and listening for messages');
});

// Graceful shutdown
let shuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return; // Prevent multiple shutdown attempts
  shuttingDown = true;
  
  console.log(`\n${signal} received. Shutting down...`);
  
  try {
    if (bot && bot.isPolling()) {
      bot.stopPolling();
    }
  } catch (error) {
    // Ignore bot stop errors during shutdown
  }
  
  try {
    await mongoose.connection.close();
    console.log('Goodbye!');
    process.exit(0);
  } catch (error) {
    console.log('Goodbye!');
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));