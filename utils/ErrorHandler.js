/**
 * Error handling utilities
 */
class ErrorHandler {
  /**
   * Handle database errors
   * @param {Error} error - Database error
   * @param {string} operation - Operation that failed
   * @returns {string} User-friendly error message
   */
  static handleDatabaseError(error, operation) {
    console.error(`Database error in ${operation}:`, error);
    
    if (error.name === 'ValidationError') {
      return 'Invalid data provided. Please check your input and try again.';
    }
    
    if (error.name === 'CastError') {
      return 'Invalid data format. Please check your input and try again.';
    }
    
    if (error.code === 11000) {
      return 'This action conflicts with existing data. Please try again.';
    }
    
    return 'Database operation failed. Please try again later.';
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @param {string} service - Service that failed
   * @returns {string} User-friendly error message
   */
  static handleApiError(error, service) {
    console.error(`API error in ${service}:`, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return 'Unable to connect to external service. Please try again later.';
    }
    
    if (error.response && error.response.status === 429) {
      return 'Service is temporarily busy. Please try again in a moment.';
    }
    
    if (error.response && error.response.status >= 500) {
      return 'External service is temporarily unavailable. Please try again later.';
    }
    
    return 'Service request failed. Please try again later.';
  }

  /**
   * Handle Telegram bot errors
   * @param {Error} error - Bot error
   * @param {string} action - Action that failed
   * @returns {string} User-friendly error message
   */
  static handleBotError(error, action) {
    console.error(`Bot error in ${action}:`, error);
    
    if (error.code === 'ETELEGRAM') {
      const description = error.response?.description || '';
      
      if (description.includes('chat not found')) {
        return 'Chat not found. Please start the bot again.';
      }
      
      if (description.includes('bot was blocked')) {
        console.log('Bot was blocked by user');
        return null; // Don't try to send error message
      }
      
      if (description.includes('message is too long')) {
        return 'Message is too long. Please try again.';
      }
      
      if (description.includes('Too Many Requests')) {
        return 'Too many requests. Please wait a moment and try again.';
      }
    }
    
    return 'Bot communication failed. Please try again.';
  }

  /**
   * Log error with context
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  static logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    console.error('Application Error:', JSON.stringify(errorInfo, null, 2));
  }

  /**
   * Create a safe error response for users
   * @param {Error} error - Original error
   * @param {string} fallbackMessage - Fallback message
   * @returns {string} Safe error message
   */
  static createSafeErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
    // Never expose internal error details to users
    if (process.env.NODE_ENV === 'development') {
      return `${fallbackMessage}\n\nDev Info: ${error.message}`;
    }
    
    return fallbackMessage;
  }
}

module.exports = ErrorHandler;