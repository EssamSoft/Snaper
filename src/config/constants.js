/**
 * Configuration constants for Snapchat Downloader
 * Single Responsibility: فصل الـ Configuration عن باقي الكود
 */

export const CONFIG = {
  BASE_URL: 'https://story.snapchat.com/@',
  
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/103.0.2',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  },
  
  APP_INFO: {
    VERSION: '1.0.0',
    DEVELOPER: 'Essam Salah',
    WEBSITE: 'https://essamsoft.com'
  },
  
  DEFAULT_USERNAME: process.env.DEFAULT_USERNAME || 'essamsoft',
  DOWNLOAD_DELAY: parseInt(process.env.DOWNLOAD_DELAY) || 300,
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000
};
