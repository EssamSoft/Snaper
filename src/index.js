/**
 * Snapchat Story Downloader
 * Main Application Entry Point
 * 
 * Architecture Principles Applied:
 * - Single Responsibility: كل module له مسؤولية واحدة
 * - Better Scaling: معماري modular يسمح بالتوسع
 * - Easier Testing: كل service مستقل ويمكن اختباره
 * - Independent Deployment: Services مستقلة ويمكن استخدامها منفصلة
 */

import 'dotenv/config';
import { CONFIG } from './config/constants.js';
import { Logger } from './utils/logger.js';
import { InputHandler } from './utils/input.js';
import { FileService } from './services/file.service.js';
import { SnapchatService } from './services/snapchat.service.js';
import { DownloadService } from './services/download.service.js';

class SnapchatDownloaderApp {
  constructor() {
    this.snapchatService = new SnapchatService();
    this.downloadService = new DownloadService();
  }

  /**
   * Display welcome banner
   */
  displayWelcome() {
    const banner = `
╔════════════════════════════════════════════════════╗
║     Snap Stories Downloader v${CONFIG.APP_INFO.VERSION}          ║
║     Developed by: ${CONFIG.APP_INFO.DEVELOPER}                  ║
║     Website: ${CONFIG.APP_INFO.WEBSITE}           ║
╚════════════════════════════════════════════════════╝
    `;
    Logger.custom(banner, 'cyan');
  }

  /**
   * Display and validate profile metadata
   */
  async displayProfileMetadata(username) {
    Logger.info(`🔍 Fetching profile data for: ${username}...`);
    
    const userData = await this.snapchatService.fetchUserData(username);
    
    if (!this.snapchatService.isValidJsonData(userData)) {
      throw new Error('Invalid user data received');
    }

    const metadata = this.snapchatService.extractProfileMetadata(userData);

    Logger.data(`\n📝 Bio: ${metadata.bio}`);
    Logger.data(`🎨 Bitmoji: ${metadata.bitmoji}\n`);

    if (metadata.isPrivate) {
      Logger.error('🔒 This user account is private.');
      Logger.info('Private accounts do not share stories publicly.\n');
      process.exit(1);
    }

    const storyCount = this.snapchatService.getStoryCount(userData);
    Logger.info(`📸 Found ${storyCount} active story(ies)\n`);

    return userData;
  }

  /**
   * Main application execution flow
   */
  async run() {
    try {
      const startTime = performance.now();

      // Display welcome message
      this.displayWelcome();

      // Get username from args or prompt
      const username = await InputHandler.getUsername();

      // Validate username
      if (!InputHandler.isValidUsername(username)) {
        Logger.error('Invalid username format.');
        Logger.info('Snapchat usernames must be 3-15 characters (letters, numbers, _, -)');
        process.exit(1);
      }

      Logger.success(`✓ Username validated: ${username}\n`);

      // Create folder structure
      Logger.info('📁 Creating download directory...');
      const folderPath = await FileService.createFolderPath(username);
      await FileService.changeDirectory(folderPath);
      Logger.success(`✓ Directory created: ${folderPath}\n`);

      // Fetch and display profile metadata
      const userData = await this.displayProfileMetadata(username);

      // Extract stories list
      const snapList = this.snapchatService.extractSnapList(userData);

      // Download all media
      Logger.info('⬇️  Starting download process...\n');
      const downloadedCount = await this.downloadService.downloadMedia(snapList);

      // Calculate execution time
      const endTime = performance.now();
      const totalTime = ((endTime - startTime) / 1000).toFixed(2);

      // Display final summary
      Logger.info('\n' + '─'.repeat(50));
      if (downloadedCount > 0) {
        Logger.success(`✅ Successfully downloaded ${downloadedCount} story(ies)`);
      } else {
        Logger.warning('⚠️  No stories were downloaded');
      }
      Logger.info(`⏱️  Total execution time: ${totalTime} seconds`);
      Logger.info('─'.repeat(50) + '\n');

      Logger.success('🎉 Process completed successfully!\n');

    } catch (error) {
      Logger.error(`\n❌ Application Error: ${error.message}`);
      
      if (error.stack && process.env.NODE_ENV === 'development') {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handler
   */
  setupGracefulShutdown() {
    process.on('SIGINT', () => {
      Logger.warning('\n\n⚠️  Process interrupted by user');
      Logger.info('Cleaning up and exiting...\n');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      Logger.warning('\n\n⚠️  Process terminated');
      process.exit(0);
    });
  }
}

// Application Entry Point
const app = new SnapchatDownloaderApp();
app.setupGracefulShutdown();
app.run().catch((error) => {
  Logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
