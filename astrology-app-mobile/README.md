# Astrology App Mobile

React Native mobile application for the Holistic Divination App - A comprehensive mystical sciences platform.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API Client**: Axios
- **Storage**: AsyncStorage
- **Authentication**: JWT + OAuth (Google/Apple)
- **UI**: Custom components with Linear Gradients

## Project Structure

```
astrology-app-mobile/
├── src/
│   ├── screens/         # Screen components
│   │   ├── onboarding/  # Welcome, onboarding flow
│   │   ├── auth/        # Login, Signup
│   │   └── home/        # Main home screen
│   ├── components/      # Reusable components
│   │   ├── common/      # Button, Input, Card, Loading
│   │   ├── forms/       # Form components
│   │   └── navigation/  # Navigation setup
│   ├── services/        # API services
│   ├── redux/           # State management
│   │   ├── slices/      # Redux slices
│   │   └── store.ts     # Redux store
│   ├── styles/          # Design system
│   │   ├── colors.ts    # Color palette
│   │   ├── fonts.ts     # Typography
│   │   └── spacing.ts   # Spacing & shadows
│   └── types/           # TypeScript types
├── App.tsx              # Root component
├── app.json            # Expo configuration
└── package.json
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI
- iOS Simulator (Mac only) or Android Studio

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd astrology-app-mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- API_URL: Your backend API URL
- Firebase configuration
- OAuth credentials

## Running the Application

### Development Mode

Start the Expo development server:
```bash
npm start
```

### iOS (Mac only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## Features

### Phase 1 (Current)

- ✅ User authentication (signup/login)
- ✅ OAuth integration scaffolding (Google/Apple)
- ✅ Onboarding flow
- ✅ Profile management
- ✅ Preferences system
- ✅ Home dashboard
- ✅ Redux state management
- ✅ API integration with backend
- ✅ Mystical UI design with gradients

### Future Phases

- Astrology birth chart display
- Daily horoscope
- Tarot card readings
- Numerology calculations
- Palm reading photo upload
- AI-powered insights
- Push notifications
- In-app purchases

## Design System

### Colors

The app uses a mystical color palette:
- **Primary**: Purple (#6B46C1)
- **Background**: Deep cosmic gradient
- **Accent**: Mystical purples, indigos, and golds

### Typography

- **Font Sizes**: xs (12) to huge (40)
- **Weights**: Light to Bold
- **Line Heights**: Tight to Loose

### Spacing

Consistent spacing scale: xs (4) to xxxl (64)

## State Management

The app uses Redux Toolkit with three main slices:

1. **authSlice**: Authentication state, user data
2. **userSlice**: Profile and preferences
3. **uiSlice**: UI state, theme, toasts

## API Integration

The app communicates with the backend via REST API:

- Automatic token refresh
- Request/response interceptors
- Error handling
- Token storage in AsyncStorage

## Navigation

Stack navigation with conditional routing:
- Unauthenticated: Welcome → Login/Signup
- Authenticated: Home and other screens

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

## Building for Production

### iOS

1. Configure `app.json` with your bundle identifier
2. Build with EAS:
```bash
eas build --platform ios
```

### Android

1. Configure `app.json` with your package name
2. Build with EAS:
```bash
eas build --platform android
```

## Environment Variables

Required environment variables:

- `API_URL`: Backend API endpoint
- `FIREBASE_*`: Firebase configuration
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `APPLE_CLIENT_ID`: Apple sign-in client ID

## Project Guidelines

1. **TypeScript**: All components must be properly typed
2. **Components**: Use functional components with hooks
3. **Styling**: Use StyleSheet.create for styles
4. **Colors**: Use colors from the design system
5. **Spacing**: Use spacing constants, not hardcoded values
6. **State**: Use Redux for global state, local state for component-specific
7. **Async**: Handle all async operations with try/catch

## Common Issues

### Metro bundler cache issues
```bash
expo start -c
```

### Node modules issues
```bash
rm -rf node_modules
npm install
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

## Support

For issues or questions, please create an issue in the repository.

## License

MIT
