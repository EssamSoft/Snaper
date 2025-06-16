#!/bin/bash
# Simple running script for Snaper

echo "===================================="
echo "Welcome to Snaper!"
echo "Snapchat Stories Downloader Tool"
echo "===================================="
echo "Starting application..."

# Change to the directory where this script is located
cd "$(dirname "$0")"
python3.11 snap_stories_downloader.py