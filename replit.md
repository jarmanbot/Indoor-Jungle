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

## Alpha Testing Mode

For isolated user testing, the app includes an Alpha Testing Mode that stores all data locally on each device:

### Features
- **Local Data Storage**: All plant data, care logs, and settings stored in browser localStorage
- **Complete Isolation**: Each tester's data remains separate and private
- **Visual Indicator**: Orange "ALPHA" badge in header when enabled
- **Easy Toggle**: Enable/disable in Settings with one click
- **Data Management**: Clear local data option for fresh starts

### Usage Instructions for Alpha Testers
1. Alpha Testing Mode is enabled by default
2. Orange "ALPHA" badge shows testing mode is active
3. All plant data is stored locally on each device
4. Each tester's data remains completely isolated
5. Admin password (`digipl@nts`) required to access shared database

### Technical Implementation
- Intercepts all API calls when alpha mode is enabled
- Uses localStorage to store plants, care logs, and custom locations
- Maintains same data structure as server for seamless switching
- Auto-generates IDs and plant numbers locally
- **Image Compression**: Automatically compresses plant photos to 400px max width with 70% quality for efficient localStorage storage
- **Individual Plant Photos**: Each plant can have its own compressed photo stored locally

## Changelog

```
Changelog:
- June 30, 2025. Alpha testers now see shared demo plant #1 from cloud database in their local storage
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