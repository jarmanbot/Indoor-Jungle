# Indoor Jungle Plant Care App

## Overview

Indoor Jungle is a comprehensive plant care application that combines real-world plant management with Web3 gaming features. The app allows users to track their plant collection, manage care schedules, and participate in a virtual plant ecosystem with NFT integration and cryptocurrency rewards.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety across the stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Uploads**: Multer middleware for plant image handling
- **API Design**: RESTful API with separate game-specific routes

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Code-first approach with migration support
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Data Models**: Separate schemas for plant care app and Web3 game features

## Key Components

### Plant Care Features
- **Plant Management**: CRUD operations for plant collection
- **Care Tracking**: Watering and feeding logs with timestamps
- **Location Management**: Custom and predefined plant locations
- **Image Uploads**: Plant photo storage and management
- **Calendar Integration**: Visual care scheduling and reminders
- **Task Management**: Automated care reminders based on plant needs

### Web3 Gaming Features
- **Virtual Plant NFTs**: ERC-721 tokens representing virtual plants
- **LVS Token**: ERC-20 utility token for in-game purchases
- **Property System**: Upgradeable virtual living spaces
- **Marketplace**: Trading platform for virtual plants and items
- **Wallet Integration**: MetaMask and other Web3 wallet support

### Smart Contracts
- **IndoorJungleNFT**: ERC-721 contract for game items (plants, pots, tools)
- **LVSToken**: ERC-20 contract for the in-game currency
- **OpenZeppelin**: Security-audited contract libraries

## Data Flow

### Plant Care Workflow
1. Users add plants with photos and care information
2. System calculates next care dates based on plant type and history
3. Users receive reminders and can log care activities
4. Care history is tracked for analytics and plant health monitoring

### Web3 Integration Workflow
1. Users connect crypto wallets to the application
2. Real plant care activities can influence virtual plant health
3. Virtual plants and items are minted as NFTs
4. Users can trade NFTs and earn LVS tokens through gameplay
5. Tokens can be used for upgrades and marketplace purchases

### API Structure
- `/api/plants/*` - Plant CRUD operations and care logging
- `/api/game/*` - Web3 game features and player management
- `/api/uploads/*` - Image upload and serving endpoints

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing
- **@radix-ui/***: Accessible UI component primitives

### Web3 Dependencies
- **@openzeppelin/contracts**: Secure smart contract templates
- **ethers**: Ethereum interaction library
- **web3**: Alternative Ethereum library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production server
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool with hot module replacement

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Built assets served by Express with static file serving
- **Database**: Neon PostgreSQL with environment-based connection strings

### Build Process
1. Frontend assets built with Vite and output to `dist/public`
2. Server bundled with esbuild for Node.js execution
3. Database migrations run automatically on deployment
4. Static files served from Express for plant images

### Scaling Considerations
- Connection pooling for database efficiency
- CDN-ready static asset serving
- Modular architecture for feature expansion
- Separate game and plant care API endpoints for load distribution

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.