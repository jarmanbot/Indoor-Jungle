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

### Google Drive Setup (Unlimited Plants)

To unlock unlimited plant storage, follow these steps:

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and name it (e.g., "Indoor Jungle App")
3. Go to "APIs & Services" → "Library"
4. Search and enable "Google Drive API"
5. Search and enable "Google+ API" (for user info)

#### Step 2: Create OAuth Credentials
1. In Google Cloud Console, go to "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add this exact URL to "Authorized redirect URIs":
   ```
   https://your-replit-url/api/auth/google/callback
   ```
   Replace `your-replit-url` with your actual Replit app URL
5. Copy the Client ID and Client Secret

#### Step 3: Configure App Secrets
1. In your Replit project, go to the "Secrets" tab
2. Add secret `GOOGLE_CLIENT_ID` with your Client ID
3. Add secret `GOOGLE_CLIENT_SECRET` with your Client Secret
4. Restart the app (stop and run again)

#### Step 4: Connect Google Drive
1. Go to Settings in the app
2. Scroll to "Google Drive Cloud Storage"
3. Click "Connect Google Drive"
4. Complete the authorization process

## Troubleshooting

### Common Issues

**"Invalid redirect URI" Error**
- Ensure the redirect URI in Google Cloud Console exactly matches your app URL with `/api/auth/google/callback` appended
- The URL must include `https://` and match exactly

**"Authorization Error"**
- Verify both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set in Replit Secrets
- Make sure there are no extra spaces or characters

**"Access Blocked"**
- Ensure both Google Drive API and Google+ API are enabled in Google Cloud Console
- Check that your Google Cloud project is active

**Pop-up Blocked**
- Allow pop-ups for your app domain in browser settings
- Try using an incognito/private browsing window

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