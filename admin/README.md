# Ministry of Transport - Admin Panel

A separate administrative interface for managing the Ministry of Transport platform.

## Features

- **Separate Authentication**: Independent login system for admin users only
- **Dashboard Overview**: Statistics and recent activity monitoring
- **User Management**: Manage system users and permissions
- **Vehicle Management**: Review and process vehicle applications
- **License Management**: Handle driver license applications
- **Transport Management**: Manage transport routes and schedules

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
cd admin
npm install
```

2. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:4000`

### Building for Production

```bash
npm run build
```

## Architecture

- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Admin Authentication

This application uses a separate authentication system from the main client application:

- Admin tokens are stored separately (`adminToken` vs `token`)
- Only users with "Admin" role can access this panel
- Independent session management

## API Integration

The admin panel connects to the same backend API server but with admin-specific endpoints and permissions:

- Base URL: `http://localhost:5000/api`
- Authentication: Bearer token in Authorization header
- Admin role verification on all protected routes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment

The application is configured to run on port 4000 to avoid conflicts with:
- Main client application (port 3000)
- Backend server (port 5000) 