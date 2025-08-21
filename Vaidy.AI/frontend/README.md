# Vaidy.AI Frontend

A modern React-based frontend for the Vaidy.AI clinical triage and queue management system.

## Features

- **Modern UI/UX**: Built with Material-UI for a professional healthcare interface
- **Real-time Updates**: WebSocket integration for live queue updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **TypeScript**: Full type safety throughout the application
- **State Management**: Zustand for efficient state management
- **Real-time Queue Management**: Live updates and provider assignment
- **Patient Intake**: Comprehensive intake form with validation
- **Dashboard Analytics**: Key metrics and system health monitoring

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API communication
- **WebSocket** for real-time updates

## Prerequisites

- Node.js 16+ and npm
- Backend services running (see main README for setup)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_QUEUE_BASE_URL=http://localhost:8082
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   └── MainDashboard.tsx
│   ├── Intake/
│   │   └── IntakeForm.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── Queue/
│       └── QueueDashboard.tsx
├── services/
│   └── api.ts
├── store/
│   └── useStore.ts
├── types/
│   └── index.ts
├── App.tsx
└── index.tsx
```

## Key Components

### MainDashboard
- System overview with key metrics
- Quick action buttons
- Queue distribution visualization
- Recent activity feed

### IntakeForm
- Patient information entry
- Clinical narrative input
- Pain assessment slider
- Vital signs collection
- Real-time risk assessment display

### QueueDashboard
- Live queue management
- Color-coded risk bands
- Provider assignment
- Real-time updates via WebSocket
- Priority-based sorting

### Header
- Application branding
- Real-time queue summary
- Notification system
- System status indicators

### Sidebar
- Navigation menu
- System status display
- Quick access to all features

## API Integration

The frontend communicates with the following backend services:

- **Intake API** (Port 8080): Patient intake and risk assessment
- **Queue Service** (Port 8082): Queue management and provider assignment
- **WebSocket** (Port 8082): Real-time queue updates

## State Management

Uses Zustand for global state management with the following stores:

- Queue entries and summary
- Provider information
- Loading states and errors
- Selected encounters

## Real-time Features

- **WebSocket Connection**: Automatic reconnection with exponential backoff
- **Live Queue Updates**: Real-time patient status changes
- **Provider Assignment**: Instant UI updates on provider assignment
- **System Health Monitoring**: Real-time system status indicators

## Styling

- **Material-UI Theme**: Custom theme with healthcare-appropriate colors
- **Responsive Design**: Mobile-first approach with breakpoints
- **Color Coding**: Risk-based color scheme (Red=Critical, Orange=High, Blue=Medium, Green=Low)
- **Accessibility**: WCAG compliant with proper contrast ratios

## Development

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript interfaces in `types/index.ts`
3. Update routing in `App.tsx` if needed
4. Add to sidebar navigation in `Sidebar.tsx`

### API Integration

1. Add API functions in `services/api.ts`
2. Update TypeScript types in `types/index.ts`
3. Add state management in `store/useStore.ts`
4. Implement in components

### Styling Guidelines

- Use Material-UI components when possible
- Follow the established color scheme
- Ensure responsive design
- Maintain accessibility standards

## Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure backend services are running
   - Check firewall settings
   - Verify WebSocket URL configuration

2. **API Calls Failing**
   - Verify backend services are running on correct ports
   - Check CORS configuration in backend
   - Ensure environment variables are set correctly

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript compilation: `npx tsc --noEmit`

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Add proper error handling
4. Include loading states
5. Test responsive design
6. Ensure accessibility compliance

## License

See main project LICENSE file.
