/**
 * Logger Utility
 * Single Responsibility: معالجة الـ Logging والـ Console Output فقط
 */

import chalk from 'chalk';

export class Logger {
  /**
   * Log informational messages
   */
  static info(message) {
    console.log(chalk.cyan(message));
  }

  /**
   * Log error messages
   */
  static error(message) {
    console.log(chalk.red(`❌ ${message}`));
  }

  /**
   * Log warning messages
   */
  static warning(message) {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  /**
   * Log success messages
   */
  static success(message) {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Log data in yellow color (legacy support)
   */
  static data(message) {
    console.log(chalk.yellow(message));
  }

  /**
   * Log with custom color
   */
  static custom(message, color = 'white') {
    console.log(chalk[color](message));
  }
}
