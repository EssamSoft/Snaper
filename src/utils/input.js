/**
 * Input Handler Utility
 * Single Responsibility: معالجة الـ User Input فقط
 */

import { CONFIG } from '../config/constants.js';
import readline from 'readline';

export class InputHandler {
  /**
   * Get username from command line arguments
   */
  static getUsernameFromArgs() {
    return process.argv[2];
  }

  /**
   * Prompt user for username input
   */
  static async promptUsername() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter a username: ', (answer) => {
        rl.close();
        resolve(answer || CONFIG.DEFAULT_USERNAME);
      });
    });
  }

  /**
   * Get username from args or prompt user
   */
  static async getUsername() {
    const argUsername = this.getUsernameFromArgs();
    
    if (argUsername) {
      return argUsername;
    }
    
    return await this.promptUsername();
  }

  /**
   * Validate username format
   */
  static isValidUsername(username) {
    // Snapchat usernames: 3-15 characters, alphanumeric, underscore, hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
    return usernameRegex.test(username);
  }
}
