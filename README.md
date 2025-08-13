# Indoor Jungle - Plant Care App

A comprehensive plant care tracking application that helps you manage and nurture your plant collection with unlimited cloud storage through Google Drive integration.

## Features

- **Plant Management**: Track up to 25 plants locally or unlimited plants with Google Drive
- **Care Logging**: Record watering, feeding, repotting, and pruning activities
- **Photo Storage**: High-resolution plant photos stored in your personal Google Drive
- **Smart Reminders**: Automated care schedules based on plant types
- **Data Backup**: Secure cloud backup and sync across all your devices

## Getting Started

### Quick Start (Local Storage Only)
1. Open the app and start adding your plants
2. Use the demo plant to explore features
3. Limited to 25 plants maximum

### Universal Google Drive Sync (Unlimited Plants)

Get unlimited plant storage with automatic backup creation and Google Drive storage:

#### Simple Setup (10 seconds)
1. **Enable Auto Backup**
   - Go to Settings → "Universal Google Drive Sync"
   - Toggle "Auto Backup" to ON
   - Backup files will be created every 4 hours automatically

2. **Upload to Google Drive**
   - Upload the downloaded backup files to any folder in your Google Drive
   - Share backup files between devices

#### Features
- **Unlimited Plants**: Store 250+, 500+, or thousands of plants
- **Auto Backup Creation**: Files created every 4 hours automatically
- **Universal Compatibility**: Works on any domain without API setup
- **Cross-Device Sync**: Download and restore on any device
- **Zero Configuration**: No API keys, client IDs, or domain registration needed

## Troubleshooting

### Common Issues

**Backup File Not Downloading**
- Check if browser is blocking downloads
- Try using a different browser or incognito mode
- Ensure you have enough storage space

**Restore Not Working**
- Verify the backup file is a valid JSON file from this app
- Check that the file isn't corrupted during upload/download
- Make sure you're selecting the correct backup file

**Can't Access Google Drive**
- Any Google account can be used - no special setup required
- Upload backup files to any folder in your Google Drive
- Share backup files between devices by downloading from Google Drive

## Data Storage

### Local Storage
- Stores up to 25 plants on each device
- Data remains on individual devices
- Includes compressed plant photos
- Export/import functionality for backups

### Google Drive Storage
- Unlimited plants (250+ supported)
- Sync across all devices
- Full-resolution plant photos
- Automatic cloud backup
- Data stored in private "IndoorJungle" folder

## Privacy & Security

- Your existing Google Drive files are never accessed or modified
- Only creates a private "IndoorJungle" folder in your Drive
- All plant data remains in your personal Google Drive
- No data is stored on external servers

## Tech Stack

- **Frontend**: React/TypeScript with Vite
- **Backend**: Express.js with TypeScript
- **Storage**: Google Drive API + Local Storage
- **UI**: Tailwind CSS with Shadcn/UI components
- **Authentication**: Google OAuth 2.0

## Development

This app is built for Replit and includes:
- Hot reload development environment
- TypeScript support
- Modern React with hooks
- Progressive Web App (PWA) capabilities

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Google Cloud setup matches the guide exactly
3. Ensure all required APIs are enabled
4. Try clearing browser cache or using incognito mode

---

Start nurturing your indoor jungle today! 🌱