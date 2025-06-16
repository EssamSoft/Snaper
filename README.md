# Snaper

A simple tool to download Snapchat stories.

## Features

- Download public Snapchat stories
- Save stories as images (.jpeg) and videos (.mp4)
- Organizes downloads by username and date

## Requirements

- Python 3.11 or higher
- Required packages: BeautifulSoup4, Requests

## Installation

1. Make sure Python 3.11 is installed on your system
2. Install required packages:
   ```
   pip install beautifulsoup4 requests
   ```

## Usage

### Option 1: Using the start.command script (Mac)

1. Double-click the `start.command` file
2. Enter a Snapchat username when prompted or press Enter to use the default

### Option 2: Running directly with Python

```
python3.11 snap_stories_downloader.py [username]
```

If no username is provided, you will be prompted to enter one.

## Output

Downloaded stories are saved in a folder structure: `username/YYYY-MM-DD/`

## Note

This tool only works with public Snapchat stories.

## Disclaimer

This tool is provided for **educational purposes only**. Please use responsibly and in accordance with Snapchat's Terms of Service and Community Guidelines. The developer does not encourage or support any activities that violate Snapchat's rules or policies. Users are solely responsible for how they use this tool and any consequences that may arise from its use.
