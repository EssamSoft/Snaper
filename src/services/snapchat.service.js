/**
 * Snapchat Service
 * Single Responsibility: التعامل مع Snapchat API والـ Data Parsing فقط
 * Independent Deployment: يمكن استخدام هذا الـ Service في تطبيقات أخرى
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { CONFIG } from '../config/constants.js';
import { Logger } from '../utils/logger.js';

export class SnapchatService {
  constructor() {
    this.axiosInstance = axios.create({
      headers: CONFIG.HEADERS,
      timeout: CONFIG.REQUEST_TIMEOUT,
      validateStatus: (status) => status >= 200 && status < 500
    });
  }

  /**
   * Fetch user data from Snapchat
   */
  async fetchUserData(username) {
    try {
      const url = `${CONFIG.BASE_URL}${username}`;
      const response = await this.axiosInstance.get(url);
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: Unable to fetch user data`);
      }

      return this.parseJsonData(response.data);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        Logger.error('Connection timeout. Please check your internet connection.');
      } else {
        Logger.error('Oh Snap! No connection with Snap!');
      }
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }
  }

  /**
   * Parse HTML and extract JSON data
   */
  parseJsonData(html) {
    try {
      const $ = cheerio.load(html);
      const scriptContent = $('#__NEXT_DATA__').html();
      
      if (!scriptContent) {
        throw new Error('Could not find __NEXT_DATA__ in page');
      }

      return JSON.parse(scriptContent.trim());
    } catch (error) {
      throw new Error(`Failed to parse JSON data: ${error.message}`);
    }
  }

  /**
   * Extract profile metadata from JSON data
   */
  extractProfileMetadata(jsonData) {
    try {
      // Try to get public profile info first
      const publicProfile = jsonData.props?.pageProps?.userProfile?.publicProfileInfo;
      
      if (publicProfile) {
        return {
          bitmoji: publicProfile.snapcodeImageUrl,
          bio: publicProfile.bio,
          isPrivate: false
        };
      }

      // Fallback for private profiles
      const userInfo = jsonData.props?.pageProps?.userProfile?.userInfo;
      
      if (userInfo) {
        return {
          bitmoji: userInfo.snapcodeImageUrl,
          bio: userInfo.displayName,
          isPrivate: true
        };
      }

      throw new Error('Could not extract profile metadata');
    } catch (error) {
      throw new Error(`Failed to extract profile metadata: ${error.message}`);
    }
  }

  /**
   * Extract snap list from JSON data
   */
  extractSnapList(jsonData) {
    try {
      const snapList = jsonData.props?.pageProps?.story?.snapList;
      return snapList || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get story count
   */
  getStoryCount(jsonData) {
    const snapList = this.extractSnapList(jsonData);
    return snapList.length;
  }

  /**
   * Validate JSON data structure
   */
  isValidJsonData(jsonData) {
    return jsonData?.props?.pageProps?.userProfile !== undefined;
  }
}
