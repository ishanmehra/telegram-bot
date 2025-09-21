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

// Initialize Telegram Bot with webhook mode for Render
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: false,
  request: {
    agentOptions: {
      keepAlive: true,
      family: 4
    },
    timeout: 30000
  }
});

// Use webhook instead of polling for Render deployment
async function initializeBot() {
  try {
    // Delete any existing webhook first
    await bot.deleteWebHook();
    console.log('Webhook deleted successfully');
    
    // Get bot info to verify token
    const botInfo = await bot.getMe();
    console.log('Bot verified:', botInfo.username);
    
    // Set webhook URL for Render
    const webhookUrl = process.env.RENDER_EXTERNAL_URL || `https://telegram-bot-2-2gkx.onrender.com`;
    await bot.setWebHook(`${webhookUrl}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`);
    console.log('Webhook set successfully:', webhookUrl);
    
  } catch (error) {
    console.error('Failed to initialize bot:', error.message);
    
    if (error.code === 'EFATAL' || error.response?.statusCode === 401) {
      console.error('Invalid bot token. Please check your TELEGRAM_BOT_TOKEN');
      process.exit(1);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Initialize bot immediately
initializeBot();

// Webhook route for receiving Telegram updates
app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Remove polling error handler since we're using webhooks
// bot.on('polling_error', ...) - not needed for webhook mode

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