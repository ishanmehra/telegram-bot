# LLM Prompts Used in Development

This document contains all the prompts used with Large Language Models during the development of the Telegram Joke Bot.

## Initial Development Prompt

**Prompt**: 
```
Objective
As the backend developer at Edzy.ai, your task is to build a Telegram bot that engages users by
delivering jokes at configurable intervals.

Requirements
1. The bot should allow a user to start a chat and automatically send a random joke every n
minutes (default: n = 1).
2. The user must be able to configure the frequency (n) at which they receive jokes.
3. The user should be able to enable or disable joke delivery at any time by sending the
commands:
● ENABLE → Resume joke delivery.
● DISABLE → Pause joke delivery.

Submission
1. Initiate a new Express project and push it to Github. We will only review the final Git
submission. You will be scored on Code structure & quality, Error handling and scalability
of code.
2. We heavily encourage use of LLMs in coding and/or expeding writing of code. We will like
you to highlight and store any prompts that you have used in a markdown file within the
Git repo.
Suggested Libraries
1. Telegram Bot API - https://core.telegram.org/bots/api
2. Official Joke API - https://github.com/15Dkatz/official_joke_api

Mongodb Model
Create a User model that stores. Feel free to add more things:
● chatId (Telegram chat reference)
● isEnabled (boolean: whether jokes are currently being sent)
● frequency (integer: minutes between jokes, default = 1)
● lastSentAt (timestamp of last joke sent)

only add the ncessary functionality just as mentioned
```

**Context**: Initial requirements and specifications for building the Telegram joke bot.

**Output**: Complete project structure including Express.js setup, MongoDB models, Telegram bot handlers, joke service, and scheduling system.

## Database Configuration Prompt

**Prompt**: "use mongodb atlas"

**Context**: User requested to use MongoDB Atlas instead of local MongoDB.

**Output**: Updated `.env` file to use MongoDB Atlas connection string format.

## Additional Prompts Used

### Code Structure Planning
- Analyzed requirements to break down into modular components
- Designed separation of concerns: models, services, handlers, utilities
- Planned error handling and validation strategies

### Implementation Details
- Created MongoDB schema with proper validation and indexing
- Implemented RESTful service architecture
- Added comprehensive error handling for API failures
- Implemented rate limiting considerations for Telegram API

### Security and Best Practices
- Environment variable configuration
- Input validation and sanitization
- Proper error message handling (don't expose internal errors)
- Graceful shutdown handling

### Testing and Deployment Considerations
- Health check endpoint for monitoring
- Structured logging for debugging
- Modular design for easy testing
- Git repository setup for deployment

## Development Approach

The development followed a systematic approach:

1. **Project Setup**: Initialize Express.js project with required dependencies
2. **Database Design**: Create MongoDB model with proper schema validation
3. **Service Layer**: Implement joke fetching service with fallback mechanisms
4. **Bot Logic**: Create comprehensive command handlers for all user interactions
5. **Scheduling**: Implement cron-based joke delivery system
6. **Error Handling**: Add robust error handling and user-friendly messages
7. **Documentation**: Document the development process and prompts used

## Key Design Decisions

- **Modular Architecture**: Separated concerns into models, services, handlers, and utilities
- **Error Resilience**: Multiple layers of error handling with fallback mechanisms
- **User Experience**: Clear command structure with helpful feedback messages
- **Scalability**: Efficient database queries and rate limiting considerations
- **Maintainability**: Well-documented code with clear separation of responsibilities

## Tools and Libraries Used

- **Express.js**: Web framework for the server
- **node-telegram-bot-api**: Telegram Bot API wrapper
- **mongoose**: MongoDB object modeling
- **axios**: HTTP client for API requests
- **node-cron**: Task scheduling
- **dotenv**: Environment variable management