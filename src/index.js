/**
 * Snapchat Story Downloader - Express API Server
 * Wraps existing services with RESTful API endpoints
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config/constants.js";
import { Logger } from "./utils/logger.js";
import { SnapchatService } from "./services/snapchat.service.js";
import { DownloadService } from "./services/download.service.js";
import { FileService } from "./services/file.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Services
const snapchatService = new SnapchatService();
const downloadService = new DownloadService();

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: CONFIG.APP_INFO.VERSION,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Check user profile and get story count
 * GET /api/user/:username
 */
app.get("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid username format. Must be 3-15 characters (letters, numbers, _, -)",
      });
    }

    Logger.info(`Fetching profile data for: ${username}`);

    // Fetch user data
    const userData = await snapchatService.fetchUserData(username);

    if (!snapchatService.isValidJsonData(userData)) {
      return res.status(404).json({
        success: false,
        error: "User not found or invalid data received",
      });
    }

    // Extract metadata
    const metadata = snapchatService.extractProfileMetadata(userData);

    // Check if account is private
    if (metadata.isPrivate) {
      return res.status(403).json({
        success: false,
        error:
          "This account is private. Private accounts do not share stories publicly.",
        isPrivate: true,
      });
    }

    // Get story count
    const storyCount = snapchatService.getStoryCount(userData);

    res.json({
      success: true,
      username,
      bio: metadata.bio,
      bitmoji: metadata.bitmoji,
      isPrivate: metadata.isPrivate,
      storyCount,
      hasStories: storyCount > 0,
    });
  } catch (error) {
    Logger.error(`Error checking user: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user data",
    });
  }
});

/**
 * Download stories for a user
 * POST /api/download
 * Body: { username: string }
 */
app.post("/api/download", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error: "Invalid username format",
      });
    }

    Logger.info(`Starting download process for: ${username}`);

    // Fetch user data
    const userData = await snapchatService.fetchUserData(username);

    if (!snapchatService.isValidJsonData(userData)) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if private
    const metadata = snapchatService.extractProfileMetadata(userData);
    if (metadata.isPrivate) {
      return res.status(403).json({
        success: false,
        error: "Cannot download from private accounts",
      });
    }

    // Create folder
    const folderPath = await FileService.createFolderPath(username);

    // Extract snap list
    const snapList = snapchatService.extractSnapList(userData);

    if (!snapList || snapList.length === 0) {
      return res.json({
        success: true,
        message: "No active stories found for this user",
        downloadedCount: 0,
        stories: [],
      });
    }

    // Download media
    const downloadedCount = await downloadService.downloadMedia(snapList);

    Logger.success(`Downloaded ${downloadedCount} stories for ${username}`);

    res.json({
      success: true,
      message: `Successfully downloaded ${downloadedCount} story(ies)`,
      downloadedCount,
      folderPath,
      stories: snapList.map((snap) => ({
        id: snap.snapMediaId,
        type: snap.snapMediaType,
        url: snap.snapMediaUrl,
      })),
    });
  } catch (error) {
    Logger.error(`Download error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to download stories",
    });
  }
});

/**
 * Get download info for stories (without downloading server-side)
 * POST /api/stories/info
 * Body: { username: string }
 */
app.post("/api/stories/info", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    Logger.info(`Fetching stories info for: ${username}`);

    // Fetch user data
    const userData = await snapchatService.fetchUserData(username);

    if (!snapchatService.isValidJsonData(userData)) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if private
    const metadata = snapchatService.extractProfileMetadata(userData);
    if (metadata.isPrivate) {
      return res.status(403).json({
        success: false,
        error: "Cannot access private accounts",
      });
    }

    // Extract snap list
    const snapList = snapchatService.extractSnapList(userData);
    console.log(snapList);

    if (!snapList || snapList.length === 0) {
      return res.json({
        success: true,
        message: "No active stories found",
        stories: [],
      });
    }

    // Return story URLs for client-side download
    res.json({
      success: true,
      username,
      storyCount: snapList.length,
      stories: snapList.map((snap, index) => ({
        id: snap.snapId.value,
        type: snap.snapMediaType,
        url: snap.snapUrls.mediaUrl,
        index: snap.snapIndex,
      })),
    });
  } catch (error) {
    Logger.error(`Error fetching stories: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch stories",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  Logger.custom(
    `
╔════════════════════════════════════════════════════╗
║     Snap Stories Downloader API v${CONFIG.APP_INFO.VERSION}     ║
║     Server running on http://localhost:${PORT}        ║
╚════════════════════════════════════════════════════╝
  `,
    "cyan"
  );
  Logger.success(`✓ API Server is ready!`);
  Logger.info(`✓ Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.warning("\n⚠️  Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  Logger.warning("\n⚠️  Server terminated");
  process.exit(0);
});
