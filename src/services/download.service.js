/**
 * Download Service
 * Single Responsibility: معالجة الـ Download Operations فقط
 * Better Scaling: يمكن إضافة ميزات مثل Parallel Downloads، Resume، إلخ
 */

import axios from 'axios';
import { createWriteStream } from 'fs';
import { CONFIG } from '../config/constants.js';
import { FileService } from './file.service.js';
import { Logger } from '../utils/logger.js';

export class DownloadService {
  constructor() {
    this.axiosInstance = axios.create({
      headers: CONFIG.HEADERS,
      responseType: 'stream',
      timeout: 60000 // 60 seconds for downloads
    });
  }

  /**
   * Download all media from snap list
   */
  async downloadMedia(snapList) {
    if (snapList.length === 0) {
      Logger.error('No user stories found for the last 24h.');
      return 0;
    }

    Logger.info(`Found ${snapList.length} story(ies) to download...\n`);

    let downloadedCount = 0;
    let skippedCount = 0;

    for (let index = 0; index < snapList.length; index++) {
      const snap = snapList[index];
      const mediaUrl = snap.snapUrls?.mediaUrl;

      if (!mediaUrl) {
        Logger.warning(`Snap ${index + 1}: No URL provided by Snapchat.`);
        skippedCount++;
        continue;
      }

      try {
        const downloaded = await this.downloadSingleMedia(mediaUrl, index + 1);
        
        if (downloaded) {
          downloadedCount++;
        } else {
          skippedCount++;
        }
        
        // Delay between downloads to avoid rate limiting
        if (index < snapList.length - 1) {
          await this.delay(CONFIG.DOWNLOAD_DELAY);
        }
      } catch (error) {
        Logger.error(`Snap ${index + 1}: ${error.message}`);
        skippedCount++;
      }
    }

    Logger.info(`\n📊 Summary:`);
    Logger.success(`Downloaded: ${downloadedCount}`);
    if (skippedCount > 0) {
      Logger.warning(`Skipped: ${skippedCount}`);
    }

    return downloadedCount;
  }

  /**
   * Download single media file
   */
  async downloadSingleMedia(mediaUrl, snapIndex) {
    try {
      // Get content type first with HEAD request
      const headResponse = await this.axiosInstance.head(mediaUrl);
      const contentType = headResponse.headers['content-type'];
      
      const extension = this.getFileExtension(contentType);
      const fileName = `${snapIndex}.${extension}`;

      // Check if file already exists
      if (FileService.fileExists(fileName)) {
        Logger.warning(`${fileName} already exists, skipping...`);
        return false;
      }

      // Download the file
      const response = await this.axiosInstance.get(mediaUrl);
      
      await this.saveStreamToFile(response.data, fileName);
      Logger.success(`Downloaded: ${fileName}`);
      
      return true;

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Download timeout');
      }
      throw new Error(`Download failed - ${error.message}`);
    }
  }

  /**
   * Get file extension based on content type
   */
  getFileExtension(contentType) {
    if (!contentType) return 'bin';
    
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
      return 'jpeg';
    }
    if (contentType.includes('image/png')) {
      return 'png';
    }
    if (contentType.includes('image')) {
      return 'jpeg'; // default for images
    }
    if (contentType.includes('video/mp4')) {
      return 'mp4';
    }
    if (contentType.includes('video')) {
      return 'mp4'; // default for videos
    }
    
    return 'bin';
  }

  /**
   * Save stream to file
   */
  async saveStreamToFile(stream, fileName) {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(fileName);

      stream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (error) => {
        reject(new Error(`Failed to write file: ${error.message}`));
      });

      stream.on('error', (error) => {
        reject(new Error(`Failed to read stream: ${error.message}`));
      });
    });
  }

  /**
   * Delay execution
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate download progress
   */
  calculateProgress(downloaded, total) {
    return Math.round((downloaded / total) * 100);
  }
}
