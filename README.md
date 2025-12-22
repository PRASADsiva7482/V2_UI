# React Dashboard with Keycloak Authentication

A modern React dashboard application with Keycloak authentication, featuring a responsive sidebar navigation and navbar with user profile.

## 🚀 Features

- **Keycloak Authentication**: Full OAuth2/OIDC integration with automatic token refresh
- **Protected Routes**: All routes secured with authentication
- **Modern UI**: Dark theme with gradient effects and smooth animations
- **Responsive Layout**: Sidebar navigation and top navbar
- **API Integration**: Axios instance with automatic Bearer token injection
- **Dashboard**: Stats cards, activity feed, and quick actions

## 📁 Project Structure

```
d:/Project/V2/UI/
├── public/
│   └── config.js              # Runtime Keycloak configuration
├── src/
│   ├── auth/
│   │   ├── keycloak.js        # Keycloak instance
│   │   ├── AuthProvider.jsx   # Authentication context
│   │   ├── api.js             # Axios with interceptors
│   │   └── PrivateRoute.jsx   # Route protection
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.jsx    # Navigation sidebar
│   │       ├── Navbar.jsx     # Top navigation bar
│   │       └── MainLayout.jsx # Layout wrapper
│   ├── pages/
│   │   └── Dashboard.jsx      # Dashboard page
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## ⚙️ Configuration

Before running the application, update `public/config.js` with your Keycloak settings:

```javascript
window.config = {
  keycloak: {
    url: 'http://your-keycloak-server:8080',
    realm: 'your-realm-name',
    clientId: 'your-client-id'
  },
  api: {
    baseUrl: 'http://your-api-server:8081/api'
  }
};
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Keycloak** in `public/config.js`

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🔐 Authentication Flow

1. App initializes and loads `config.js`
2. `AuthProvider` initializes Keycloak with `login-required`
3. User is redirected to Keycloak login if not authenticated
4. After successful login, user is redirected back to the app
5. Token is automatically refreshed every minute
6. All API calls include `Authorization: Bearer <token>` header

## 🎨 UI Components

### Sidebar
- Fixed left navigation
- Active route highlighting
- Smooth hover effects
- Responsive (collapses on mobile)

### Navbar
- Search bar
- Notification badge
- User profile with avatar
- Logout button

### Dashboard
- Stats cards with trend indicators
- Recent activity feed
- Quick action buttons
- Responsive grid layout

## 📦 Dependencies

- **react**: ^18.3.1
- **react-dom**: ^18.3.1
- **react-router-dom**: ^6.26.0
- **keycloak-js**: ^25.0.0
- **axios**: ^1.7.2
- **lucide-react**: ^0.400.0
- **vite**: ^5.3.4

## 🔧 API Usage

Use the configured axios instance for API calls:

```javascript
import api from './auth/api';

// GET request
const response = await api.get('/users');

// POST request
const response = await api.post('/users', { name: 'John' });
```

The `Authorization` header is automatically added to all requests.

## 📝 Notes

- Ensure your Keycloak client is configured for public access
- Enable CORS on your Keycloak server for the app origin
- The app uses PKCE flow for enhanced security
- Token refresh happens automatically every 60 seconds

## 🎯 Next Steps

1. Configure your Keycloak server
2. Update `public/config.js` with correct values
3. Add feature-specific pages (Users, Products, etc.)
4. Implement actual API endpoints
5. Customize the theme in `src/index.css`

---

Built with ❤️ using React + Vite + Keycloak
