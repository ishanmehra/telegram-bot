const axios = require('axios');

class JokeService {
  constructor() {
    this.apiUrl = 'https://official-joke-api.appspot.com/jokes/random';
  }

  /**
   * Fetch a random joke from the Official Joke API
   * @returns {Promise<string>} Formatted joke string
   */
  async getRandomJoke() {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Telegram-Joke-Bot/1.0'
        }
      });

      const joke = response.data;
      
      if (!joke || !joke.setup || !joke.punchline) {
        throw new Error('Invalid joke format received from API');
      }

      return this.formatJoke(joke);
    } catch (error) {
      console.error('Error fetching joke:', error.message);
      
      // Return a fallback joke if API fails
      return this.getFallbackJoke();
    }
  }

  /**
   * Format joke for display
   * @param {Object} joke - Joke object with setup and punchline
   * @returns {string} Formatted joke
   */
  formatJoke(joke) {
    return `😂 *Here's your joke:*\n\n${joke.setup}\n\n${joke.punchline}`;
  }

  /**
   * Fallback joke when API is unavailable
   * @returns {string} Fallback joke
   */
  getFallbackJoke() {
    const fallbackJokes = [
      {
        setup: "Why don't scientists trust atoms?",
        punchline: "Because they make up everything!"
      },
      {
        setup: "What do you call a fake noodle?",
        punchline: "An impasta!"
      },
      {
        setup: "Why did the scarecrow win an award?",
        punchline: "He was outstanding in his field!"
      },
      {
        setup: "What do you call a bear with no teeth?",
        punchline: "A gummy bear!"
      }
    ];

    const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    return this.formatJoke(randomJoke);
  }

  /**
   * Validate if the service is working
   * @returns {Promise<boolean>} Service status
   */
  async isServiceHealthy() {
    try {
      await axios.get(this.apiUrl, { timeout: 3000 });
      return true;
    } catch (error) {
      console.warn('Joke API health check failed:', error.message);
      return false;
    }
  }
}

module.exports = JokeService;