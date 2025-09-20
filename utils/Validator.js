/**
 * Validation utilities for user inputs
 */
class Validator {
  /**
   * Validate frequency value
   * @param {number} frequency - Frequency in minutes
   * @returns {Object} Validation result
   */
  static validateFrequency(frequency) {
    if (typeof frequency !== 'number' || isNaN(frequency)) {
      return {
        isValid: false,
        error: 'Frequency must be a valid number'
      };
    }

    if (!Number.isInteger(frequency)) {
      return {
        isValid: false,
        error: 'Frequency must be a whole number'
      };
    }

    if (frequency < 1) {
      return {
        isValid: false,
        error: 'Frequency must be at least 1 minute'
      };
    }

    if (frequency > 1440) {
      return {
        isValid: false,
        error: 'Frequency cannot exceed 1440 minutes (24 hours)'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * Validate chat ID
   * @param {string} chatId - Telegram chat ID
   * @returns {Object} Validation result
   */
  static validateChatId(chatId) {
    if (!chatId || typeof chatId !== 'string') {
      return {
        isValid: false,
        error: 'Chat ID must be a valid string'
      };
    }

    if (chatId.trim().length === 0) {
      return {
        isValid: false,
        error: 'Chat ID cannot be empty'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * Sanitize user input text
   * @param {string} text - Input text
   * @returns {string} Sanitized text
   */
  static sanitizeText(text) {
    if (typeof text !== 'string') {
      return '';
    }

    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }
}

module.exports = Validator;