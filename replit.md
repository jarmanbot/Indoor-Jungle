# replit.md

## Overview

Indoor Jungle is a Web3 plant care application that combines a traditional plant care tracker with a virtual plant game and NFT ecosystem. The project consists of a real-world plant care app integrated with a blockchain-based game called "Indoor Jungle" where players collect, nurture, and trade virtual plants as NFTs using LVS (Leaves) tokens.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React/TypeScript with Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data management
- **UI Components**: Shadcn/ui with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management

### Web3 Integration
- **Smart Contracts**: Solidity contracts for NFTs and ERC-20 tokens
- **NFT System**: ERC-721 tokens for plants, pots, tools, and property
- **Token Economy**: LVS (Leaves) ERC-20 token as in-game currency
- **Wallet Integration**: MetaMask and other Web3 wallet support

## Key Components

### Plant Care System
- **Plant Management**: CRUD operations for real plants with photos, care schedules, and location tracking
- **Care Logging**: Watering and feeding history with timestamps and notes
- **Notifications**: Plant care reminders and status tracking
- **Calendar Integration**: Visual calendar showing care schedules and tasks

### Game System
- **Virtual Plants**: NFT-based plants with rarity, growth stages, and attributes
- **Property Progression**: Multiple property levels from studio apartment to luxury mansion
- **Marketplace**: Player-to-player trading of virtual plants and items
- **Token Economy**: LVS token for purchases, upgrades, and rewards

### Database Schema
- **Users**: Authentication and user management
- **Plants**: Real plant data with care tracking
- **Game Players**: Virtual game profiles linked to wallet addresses
- **Virtual Plants**: NFT plant data with game attributes
- **Care Logs**: Historical watering and feeding records

## Data Flow

### Plant Care Flow
1. User adds real plants with photos and basic information
2. System generates care schedules based on plant types
3. Users log watering and feeding activities
4. Calendar displays upcoming care tasks and history

### Game Integration Flow
1. Users connect Web3 wallets to access game features
2. Real plant care data influences virtual plant health
3. Virtual achievements unlock features in the care app
4. NFT plants can be traded on the marketplace

### Authentication Flow
- **Replit Auth Integration**: Secure OpenID Connect authentication
- **Landing Page**: Beautiful welcome screen for unauthenticated users
- **Automatic Redirects**: Users redirected to appropriate pages after login
- **Session Management**: Secure session storage with PostgreSQL backend
- **User Profile**: Integration with Replit user data (name, email, profile image)

## External Dependencies

### Frontend Dependencies
- React ecosystem (React Router via Wouter, React Hook Form)
- UI libraries (Radix UI components, Lucide icons)
- Styling (Tailwind CSS, class-variance-authority)
- Date handling (date-fns)

### Backend Dependencies
- Express.js with TypeScript support
- Neon Database (PostgreSQL serverless)
- Drizzle ORM for database operations
- File upload handling with Multer

### Web3 Dependencies
- OpenZeppelin contracts for secure NFT and token implementations
- Web3.js and Ethers.js for blockchain interactions
- Stripe integration for payment processing

## Deployment Strategy

### Development Environment
- Replit-based development with hot reload
- PostgreSQL database provisioned through Replit
- Vite dev server for frontend development
- Express server for API and file serving

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles server code
- Static assets served from Express
- Database migrations run automatically

### Hosting Configuration
- Autoscale deployment target on Replit
- Port 5000 mapped to external port 80
- Public folder for static assets and uploads
- Environment variables for database and API keys

## Local Storage System

The app uses a robust local storage system that stores all data on each device:

### Features
- **Local Data Storage**: All plant data, care logs, and settings stored in browser localStorage
- **Complete Device Isolation**: Each device's data remains separate and private
- **Export/Import**: JSON backup and restore functionality for data portability
- **Data Management**: Cleanup and clear data options in Settings
- **Automatic Initialization**: Includes demo plant on first use

### Usage Instructions
1. All data is stored locally on each device by default
2. Regular backups are recommended using the export feature
3. Data can be imported from backup files
4. Admin password (`digipl@nts`) required to clear all data

### Technical Implementation
- Uses localStorage to store plants, care logs, and custom locations
- Auto-generates IDs and plant numbers locally
- **Image Compression**: Automatically compresses plant photos to 400px max width with 70% quality for efficient localStorage storage
- **Individual Plant Photos**: Each plant can have its own compressed photo stored locally
- **Export/Import System**: JSON-based backup and restore functionality

## Changelog

```
Changelog:
- July 29, 2025. Added interactive plant rolodex interface - plants now display in an elegant carousel with swipe navigation, visual care status, and enhanced plant cards
- July 29, 2025. Fixed "Set Reminder" functionality - now properly updates nextCheck date in local storage instead of attempting server API calls
- July 29, 2025. Enhanced plant deletion and demo plant toggle with immediate cache refresh - plants now appear/disappear instantly without page refresh
- July 16, 2025. Optimized app performance - fixed React state update warning in Game component, reduced query frequency, improved caching
- July 16, 2025. Moved demo plant section to top of Settings page for better visibility
- July 16, 2025. Enhanced export/import system with multiple fallback methods for browser compatibility
- July 16, 2025. Improved file picker to accept any file type and bypass browser restrictions
- July 14, 2025. Fixed demo plant deletion in Settings - removed auto-initialization that was preventing demo plant removal
- July 14, 2025. Enhanced empty state message with link to Settings for demo plant option
- July 14, 2025. Fixed all care log forms (feeding, repotting, soil top-up, pruning) to work with local storage - removed server API dependencies
- July 14, 2025. Completely removed alpha mode and replaced with robust local storage system
- July 14, 2025. Added comprehensive export/import functionality for data backup and recovery
- July 14, 2025. Updated Settings page with local storage management features
- July 14, 2025. Implemented clean local storage architecture with demo plant initialization
- July 7, 2025. Added demo plant toggle in Settings - users can remove demo plant to use plant #1 for their own plant, with warning dialog when restoring demo plant over existing user plant
- July 7, 2025. Enhanced plant deletion with complete data cleanup - removes all associated care logs automatically
- July 7, 2025. Fixed alpha mode duplicate ID issues - IDs now properly increment starting from 2 (demo plant uses ID 1)
- July 7, 2025. Added automatic orphaned data cleanup in alpha mode with manual cleanup button in Settings
- July 7, 2025. Cleaned up all uploaded assets and unnecessary server-side files
- July 7, 2025. Implemented comprehensive cascading deletion for both alpha mode and server database
- June 30, 2025. Added image compression for alpha mode with individual plant photos (400px max, 70% quality)
- June 30, 2025. Added admin password protection for "Clear all data" functionality
- June 30, 2025. Added Replit Auth integration with OpenID Connect authentication
- June 27, 2025. Added password-protected Alpha Testing Mode (default on) with admin password digipl@nts
- June 27, 2025. Added Alpha Testing Mode for isolated user testing
- June 14, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```