# Telegram Joke Bot

A Telegram bot that delivers jokes at configurable intervals, built with Express.js and MongoDB Atlas.

## Features

- 🤖 **Automated Joke Delivery**: Sends random jokes at user-configurable intervals
- ⚙️ **Configurable Frequency**: Users can set joke delivery frequency from 1 to 1440 minutes
- 🔄 **Enable/Disable Controls**: Users can pause and resume joke delivery anytime
- 📚 **Fallback System**: Built-in fallback jokes when external API is unavailable
- 💾 **Persistent Storage**: User preferences stored in MongoDB Atlas
- 🛡️ **Error Handling**: Comprehensive error handling and validation

## Commands

- `/start` - Start the bot and begin receiving jokes
- `ENABLE` - Resume joke delivery
- `DISABLE` - Pause joke delivery
- `/frequency <number>` - Set frequency in minutes (1-1440)
- `/status` - Check your current settings
- `/joke` - Get a joke right now
- `/help` - Show help message

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Telegram Bot Token (from @BotFather)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd telegram-joke-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/telegram_joke_bot?retryWrites=true&w=majority
   PORT=3000
   NODE_ENV=development
   ```

4. Start the application:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Project Structure

```
├── app.js                 # Main application entry point
├── models/
│   └── User.js           # MongoDB user schema
├── services/
│   └── JokeService.js    # Joke fetching service
├── handlers/
│   └── BotHandlers.js    # Telegram bot command handlers
├── utils/
│   ├── Validator.js      # Input validation utilities
│   └── ErrorHandler.js  # Error handling utilities
├── PROMPTS.md           # LLM prompts used in development
└── README.md
```

## API Integration

- **Official Joke API**: https://official-joke-api.appspot.com/jokes/random
- **Telegram Bot API**: Official Telegram Bot API for message handling

## Database Schema

### User Model
```javascript
{
  chatId: String,        // Telegram chat ID (unique)
  isEnabled: Boolean,    // Joke delivery status
  frequency: Number,     // Minutes between jokes (1-1440)
  lastSentAt: Date,     // Timestamp of last joke sent
  createdAt: Date,      // Account creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## Error Handling

The application includes comprehensive error handling:

- **Database Errors**: Validation errors, connection issues, duplicate keys
- **API Errors**: Network failures, rate limiting, service unavailability
- **Bot Errors**: Blocked users, invalid chat IDs, message failures
- **Fallback Mechanisms**: Local jokes when external API fails

## Deployment

### Environment Variables

Ensure these environment variables are set in production:

```env
TELEGRAM_BOT_TOKEN=your_production_bot_token
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
NODE_ENV=production
```

### Health Check

The application provides a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "Bot is running",
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic restarts on file changes.

### Code Quality

The codebase follows these principles:

- **Modular Architecture**: Clear separation of concerns
- **Error Resilience**: Multiple layers of error handling
- **Input Validation**: All user inputs are validated and sanitized
- **Documentation**: Comprehensive code documentation
- **Security**: Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please check the issues section of the repository.