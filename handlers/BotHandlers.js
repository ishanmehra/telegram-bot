const User = require('../models/User');

class BotHandlers {
  constructor(bot, jokeService) {
    this.bot = bot;
    this.jokeService = jokeService;
  }

  /**
   * Set up all bot command handlers
   */
  setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    
    // Enable command
    this.bot.onText(/^ENABLE$/i, (msg) => this.handleEnable(msg));
    
    // Disable command
    this.bot.onText(/^DISABLE$/i, (msg) => this.handleDisable(msg));
    
    // Frequency command
    this.bot.onText(/^\/frequency (\d+)$/, (msg, match) => this.handleFrequency(msg, match));
    
    // Status command
    this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));
    
    // Help command
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
    
    // Manual joke request
    this.bot.onText(/\/joke/, (msg) => this.handleManualJoke(msg));
  }

  /**
   * Handle /start command
   */
  async handleStart(msg) {
    const chatId = msg.chat.id.toString();
    
    try {
      let user = await User.findOne({ chatId });
      
      if (!user) {
        user = new User({
          chatId,
          isEnabled: true,
          frequency: 1,
          lastSentAt: null
        });
        await user.save();
        
        const welcomeMessage = `🎉 *Welcome to the Joke Bot!*\n\n` +
          `I'll send you a random joke every *${user.frequency} minute(s)*.\n\n` +
          `*Commands:*\n` +
          `• ENABLE - Resume joke delivery\n` +
          `• DISABLE - Pause joke delivery\n` +
          `• /frequency <number> - Set frequency (1-1440 minutes)\n` +
          `• /status - Check your current settings\n` +
          `• /joke - Get a joke right now\n` +
          `• /help - Show this help message\n\n` +
          `Let's start with your first joke! 😄`;
        
        await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
        
        // Send first joke immediately
        await this.sendJokeToUser(user);
      } else {
        await this.bot.sendMessage(chatId, 
          `👋 Welcome back! You're already registered.\n\n` +
          `Current status: ${user.isEnabled ? '✅ Enabled' : '❌ Disabled'}\n` +
          `Frequency: ${user.frequency} minute(s)\n\n` +
          `Type /help to see available commands.`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Error in start handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Handle ENABLE command
   */
  async handleEnable(msg) {
    const chatId = msg.chat.id.toString();
    
    try {
      const user = await User.findOne({ chatId });
      
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }
      
      if (user.isEnabled) {
        await this.bot.sendMessage(chatId, '✅ Joke delivery is already enabled!');
        return;
      }
      
      user.isEnabled = true;
      await user.save();
      
      await this.bot.sendMessage(chatId, 
        `✅ *Joke delivery enabled!*\n\n` +
        `You'll receive jokes every *${user.frequency} minute(s)*.`,
        { parse_mode: 'Markdown' }
      );
      
      // Send a joke immediately when enabled
      await this.sendJokeToUser(user);
    } catch (error) {
      console.error('Error in enable handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Handle DISABLE command
   */
  async handleDisable(msg) {
    const chatId = msg.chat.id.toString();
    
    try {
      const user = await User.findOne({ chatId });
      
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }
      
      if (!user.isEnabled) {
        await this.bot.sendMessage(chatId, '❌ Joke delivery is already disabled!');
        return;
      }
      
      user.isEnabled = false;
      await user.save();
      
      await this.bot.sendMessage(chatId, 
        '⏸️ *Joke delivery disabled.*\n\nSend ENABLE to resume receiving jokes.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error in disable handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Handle /frequency command
   */
  async handleFrequency(msg, match) {
    const chatId = msg.chat.id.toString();
    const frequency = parseInt(match[1]);
    
    try {
      if (frequency < 1 || frequency > 1440) {
        await this.bot.sendMessage(chatId, 
          '❌ Frequency must be between 1 and 1440 minutes (24 hours).'
        );
        return;
      }
      
      const user = await User.findOne({ chatId });
      
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }
      
      user.frequency = frequency;
      await user.save();
      
      await this.bot.sendMessage(chatId, 
        `✅ *Frequency updated!*\n\n` +
        `You'll now receive jokes every *${frequency} minute(s)*.`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error in frequency handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Handle /status command
   */
  async handleStatus(msg) {
    const chatId = msg.chat.id.toString();
    
    try {
      const user = await User.findOne({ chatId });
      
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }
      
      const status = user.isEnabled ? '✅ Enabled' : '❌ Disabled';
      const lastSent = user.lastSentAt ? 
        `Last joke: ${user.lastSentAt.toLocaleString()}` : 
        'No jokes sent yet';
      
      const statusMessage = `📊 *Your Joke Bot Status*\n\n` +
        `Status: ${status}\n` +
        `Frequency: ${user.frequency} minute(s)\n` +
        `${lastSent}`;
      
      await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in status handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Handle /help command
   */
  async handleHelp(msg) {
    const chatId = msg.chat.id.toString();
    
    const helpMessage = `🤖 *Joke Bot Help*\n\n` +
      `*Commands:*\n` +
      `• /start - Start the bot and begin receiving jokes\n` +
      `• ENABLE - Resume joke delivery\n` +
      `• DISABLE - Pause joke delivery\n` +
      `• /frequency <number> - Set frequency (1-1440 minutes)\n` +
      `• /status - Check your current settings\n` +
      `• /joke - Get a joke right now\n` +
      `• /help - Show this help message\n\n` +
      `*Examples:*\n` +
      `• \`/frequency 5\` - Get jokes every 5 minutes\n` +
      `• \`/frequency 60\` - Get jokes every hour\n\n` +
      `Enjoy the jokes! 😄`;
    
    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /joke command (manual joke request)
   */
  async handleManualJoke(msg) {
    const chatId = msg.chat.id.toString();
    
    try {
      const user = await User.findOne({ chatId });
      
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }
      
      await this.sendJokeToUser(user);
    } catch (error) {
      console.error('Error in manual joke handler:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Send a joke to a specific user
   */
  async sendJokeToUser(user) {
    try {
      const joke = await this.jokeService.getRandomJoke();
      await this.bot.sendMessage(user.chatId, joke, { parse_mode: 'Markdown' });
      await user.markJokeSent();
    } catch (error) {
      console.error(`Error sending joke to user ${user.chatId}:`, error);
      // Try to send an error message to the user
      try {
        await this.bot.sendMessage(user.chatId, 
          '❌ Sorry, I couldn\'t fetch a joke right now. Please try again later.'
        );
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
  }

  /**
   * Send scheduled jokes to all eligible users
   */
  async sendScheduledJokes() {
    try {
      const users = await User.find({ isEnabled: true });
      
      for (const user of users) {
        if (user.shouldReceiveJoke()) {
          await this.sendJokeToUser(user);
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error in scheduled jokes:', error);
    }
  }
}

module.exports = BotHandlers;