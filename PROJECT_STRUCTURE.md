# OSM Portal - Project Structure

## 📁 Directory Layout

```
OnScreenMarking/
├── UI/                              # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout wrapper with navbar & sidebar
│   │   │   ├── Navbar.jsx           # Top navigation bar with user info
│   │   │   ├── Sidebar.jsx          # Side navigation menu
│   │   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Dashboard with statistics
│   │   │   ├── Login.jsx            # Authentication page
│   │   │   ├── Scripts.jsx          # Script management & marking
│   │   │   ├── Reports.jsx          # Analytics & reporting
│   │   │   └── Settings.jsx         # User preferences & settings
│   │   │
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── typescript.svg
│   │   │   └── vite.svg
│   │   │
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── main.jsx                 # React entry point
│   │   ├── counter.js               # Utility component
│   │   └── style.css                # Global styles
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── dist/                        # Production build output
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-*.css
│   │   │   └── index-*.js
│   │   └── ...
│   │
│   ├── node_modules/                # Dependencies (not in git)
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite build configuration
│   ├── package.json                 # Project dependencies & scripts
│   ├── package-lock.json            # Dependency lock file
│   └── README.md                    # UI project documentation
│
├── API/                             # Backend API (placeholder)
│
├── .git/                            # Git repository
├── .gitignore                       # Git ignore rules
├── FEATURES.md                      # Complete features documentation
├── PROJECT_STRUCTURE.md             # This file
└── README.md                        # Main project documentation
```

## 📄 File Descriptions

### Components (`src/components/`)

#### `Layout.jsx`
- Main layout wrapper component
- Integrates Navbar and Sidebar
- Provides outlet for page content
- Responsive grid layout

#### `Navbar.jsx`
- Top navigation bar
- OSM Portal branding
- Notification bell
- User profile display
- Logout functionality
- Gradient background

#### `Sidebar.jsx`
- Side navigation menu
- Menu items:
  - Dashboard
  - Scripts
  - Reports
  - Examiners
  - Subjects
  - Settings
- Active route highlighting
- Sticky positioning

#### `ProtectedRoute.jsx`
- Route protection wrapper
- Checks authentication token
- Redirects to login if not authenticated
- Uses localStorage for token storage

### Pages (`src/pages/`)

#### `Home.jsx` (Dashboard)
- Statistics cards (5 metrics)
- Progress bar visualization
- Recent scripts table
- Real-time data display
- Status indicators

#### `Login.jsx`
- User type selection
- Email input field
- Password input field
- Authentication logic
- Token management
- Demo credentials

#### `Scripts.jsx`
- Script search functionality
- Status filtering
- Scripts data table
- Script viewer modal
- Marking tools interface
- Score input form
- Download functionality

#### `Reports.jsx`
- Three report types:
  1. Summary Report
  2. Subject-wise Report
  3. Examiner Performance Report
- Date range selector
- Export functionality
- Data visualization
- Charts and tables

#### `Settings.jsx`
- Account settings
- Notification preferences
- Marking preferences
- Security settings
- Privacy controls
- Display settings
- Save functionality

### Configuration Files

#### `vite.config.js`
```javascript
- React plugin
- Tailwind CSS plugin
- Build optimization
```

#### `package.json`
```json
{
  "name": "ui",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^7.14.2",
    "lucide-react": "^1.12.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.4.0",
    "tailwindcss": "^4.2.4",
    "@tailwindcss/vite": "^4.2.4"
  }
}
```

#### `index.html`
- HTML template
- Root div for React
- Script module reference

### Styling

#### `style.css`
- Tailwind CSS import
- Global styles
- Custom utilities

## 🔄 Component Hierarchy

```
App
├── Router
│   ├── Route: /login
│   │   └── Login
│   │
│   └── Route: Protected Routes
│       └── ProtectedRoute
│           └── Layout
│               ├── Navbar
│               ├── Sidebar
│               └── Outlet
│                   ├── Home (/)
│                   ├── Scripts (/scripts)
│                   ├── Reports (/reports)
│                   ├── Examiners (/examiners)
│                   ├── Subjects (/subjects)
│                   └── Settings (/settings)
```

## 📊 Data Flow

```
Login Page
    ↓
Authentication
    ↓
Store Token & User Info
    ↓
Protected Route Check
    ↓
Dashboard (Home)
    ├── View Statistics
    ├── View Recent Scripts
    └── Navigate to Other Pages
        ├── Scripts
        │   ├── Search & Filter
        │   ├── View Script Details
        │   └── Mark & Score
        ├── Reports
        │   ├── Summary Report
        │   ├── Subject Report
        │   └── Examiner Report
        └── Settings
            └── Update Preferences
```

## 🎯 Key Features by File

| Feature | File | Component |
|---------|------|-----------|
| Authentication | Login.jsx | Login |
| Dashboard | Home.jsx | Home |
| Script Management | Scripts.jsx | Scripts |
| Marking Tools | Scripts.jsx | Scripts Modal |
| Analytics | Reports.jsx | Reports |
| User Settings | Settings.jsx | Settings |
| Navigation | Navbar.jsx, Sidebar.jsx | Navbar, Sidebar |
| Route Protection | ProtectedRoute.jsx | ProtectedRoute |
| Layout | Layout.jsx | Layout |

## 🚀 Build Process

```
Source Code (src/)
    ↓
Vite Build
    ↓
Transpilation & Bundling
    ↓
Tailwind CSS Processing
    ↓
Asset Optimization
    ↓
Production Build (dist/)
    ├── index.html
    ├── assets/index-*.css
    └── assets/index-*.js
```

## 📦 Dependencies

### Production Dependencies
- **react** (19.2.5): UI framework
- **react-dom** (19.2.5): React DOM rendering
- **react-router-dom** (7.14.2): Client-side routing
- **lucide-react** (1.12.0): Icon library

### Development Dependencies
- **vite** (5.4.0): Build tool
- **@vitejs/plugin-react** (4.2.1): React plugin for Vite
- **tailwindcss** (4.2.4): Utility-first CSS framework
- **@tailwindcss/vite** (4.2.4): Tailwind CSS Vite plugin
- **autoprefixer** (10.5.0): CSS vendor prefixing
- **postcss** (8.5.12): CSS transformation

## 🔧 Scripts

### Development
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### Production Build
```bash
npm run build
# Creates optimized production build in dist/
```

### Preview
```bash
npm run preview
# Previews production build locally
```

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🎨 Color Palette

- **Primary Blue:** #2563eb
- **Success Green:** #16a34a
- **Warning Yellow:** #eab308
- **Error Red:** #dc2626
- **Info Purple:** #9333ea
- **Secondary Orange:** #ea580c

## 🔐 Authentication Flow

```
1. User enters credentials on Login page
2. Selects user type (Examiner/Coordinator)
3. Submits form
4. Token stored in localStorage
5. User info stored in localStorage
6. Redirected to Dashboard
7. Protected routes check token
8. If valid, allow access
9. If invalid, redirect to login
```

## 📊 State Management

- **localStorage:** Token, user type, user name
- **React State:** Component-level state (search, filters, modals)
- **URL Params:** Route-based navigation

## 🎯 Performance Optimizations

- Code splitting via Vite
- CSS minification
- JavaScript minification
- Asset optimization
- Lazy loading support
- Efficient re-renders

## 📝 Code Standards

- **Language:** JavaScript ES6+
- **Framework:** React 19
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Build:** Vite 5

## 🔄 Development Workflow

1. Clone repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Make changes
5. Test in browser
6. Build for production: `npm run build`
7. Deploy dist/ folder

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Production Ready
