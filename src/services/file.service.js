/**
 * File Service
 * Single Responsibility: معالجة File System Operations فقط
 * Easier Testing: يمكن اختبار جميع العمليات بشكل منفصل
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export class FileService {
  /**
   * Create folder path based on username and current date
   */
  static async createFolderPath(username) {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const folderPath = path.join(username, currentDate);

    if (!existsSync(folderPath)) {
      await fs.mkdir(folderPath, { recursive: true });
    }

    return folderPath;
  }

  /**
   * Save file to disk
   */
  static async saveFile(filePath, data) {
    try {
      await fs.writeFile(filePath, data);
      return true;
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  static fileExists(filePath) {
    return existsSync(filePath);
  }

  /**
   * Change current working directory
   */
  static async changeDirectory(folderPath) {
    try {
      process.chdir(folderPath);
      return true;
    } catch (error) {
      throw new Error(`Failed to change directory: ${error.message}`);
    }
  }

  /**
   * Get file stats
   */
  static async getFileStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
