# OSM Portal - On-Screen Marking System

A comprehensive digital evaluation platform for CBSE Class 12 board exams, implementing the On-Screen Marking (OSM) system for efficient and transparent assessment.

## 🎯 Features

### 1. **Dashboard & Analytics**
- Real-time evaluation statistics
- Total scripts, evaluated, pending, and in-progress counts
- Average score tracking
- Overall progress visualization
- Recent scripts activity log
- Performance metrics

### 2. **Answer Scripts Management**
- Browse and search answer scripts by:
  - Student name
  - Roll number
  - Script ID
- Filter by evaluation status:
  - Pending
  - In Progress
  - Completed
- View detailed script information
- Download scripts for offline reference

### 3. **Digital Marking Interface**
- **Annotation Tools:**
  - Tick (✓) - Mark correct answers
  - Circle (⭕) - Highlight important sections
  - Underline (_) - Emphasize key points
  - Comments (💬) - Add feedback notes

- **Scoring System:**
  - Enter marks out of 100
  - Auto-save marking progress
  - Prevent accidental data loss

- **Script Viewer:**
  - High-resolution scanned image display
  - Zoom and pan capabilities
  - Full-screen mode support

### 4. **Reports & Analytics**
Three comprehensive report types:

#### Summary Report
- Total scripts evaluated
- Average score distribution
- Completion rate
- Examiner activity metrics
- Score distribution charts (90-100, 80-89, 70-79, 60-69, Below 60)

#### Subject-wise Report
- Scripts per subject
- Evaluation progress by subject
- Average scores by subject
- Pending scripts per subject
- Subject performance comparison

#### Examiner Performance Report
- Scripts evaluated per examiner
- Average time per script
- Accuracy rate
- Performance ratings
- Productivity metrics

### 5. **User Management**
- **Examiner Role:**
  - Evaluate assigned scripts
  - View personal statistics
  - Access marking tools
  - Submit scores

- **Coordinator Role:**
  - Monitor overall evaluation progress
  - View all examiners' performance
  - Generate reports
  - Manage script assignments
  - Access audit logs

### 6. **Settings & Preferences**
- **Account Settings:**
  - Email management
  - Profile information

- **Notification Preferences:**
  - Email notifications
  - New script assignments
  - Daily evaluation summary

- **Marking Preferences:**
  - Marking speed (Slow/Normal/Fast)
  - Script timeout settings
  - Auto-save functionality
  - Annotation tools toggle

- **Security:**
  - Two-factor authentication
  - Password management
  - Access control

- **Privacy & Compliance:**
  - Coordinator visibility settings
  - Audit log permissions
  - Data privacy controls

- **Display Settings:**
  - Theme selection (Light/Dark/Auto)

## 🔐 Security Features

- **Authentication:**
  - Secure login with email and password
  - User type selection (Examiner/Coordinator)
  - Protected routes with token-based access

- **Data Protection:**
  - Encrypted script storage
  - Audit trails for all evaluations
  - Compliance with CBSE guidelines

- **Access Control:**
  - Role-based permissions
  - Script assignment verification
  - Examiner-specific access

## 📊 Key Metrics Tracked

- **Evaluation Progress:**
  - Total scripts assigned
  - Scripts evaluated
  - Scripts pending
  - Scripts in progress
  - Completion percentage

- **Performance Metrics:**
  - Average score per subject
  - Average score per examiner
  - Evaluation time per script
  - Accuracy rates

- **Quality Assurance:**
  - Score distribution analysis
  - Examiner consistency checks
  - Anomaly detection

## 🎨 User Interface

- **Responsive Design:**
  - Desktop-optimized layout
  - Sidebar navigation
  - Mobile-friendly components

- **Visual Hierarchy:**
  - Color-coded status indicators
  - Progress bars
  - Icon-based navigation
  - Clear typography

- **Accessibility:**
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation support
  - High contrast mode

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 📝 Demo Credentials

- **Email:** examiner@cbse.gov.in
- **Password:** password
- **User Types:** Examiner / Coordinator

## 🛠️ Technology Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **Icons:** Lucide React
- **Language:** JavaScript (ES6+)

## 📁 Project Structure

```
UI/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Side navigation menu
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/
│   │   ├── Home.jsx            # Dashboard
│   │   ├── Login.jsx           # Authentication
│   │   ├── Scripts.jsx         # Script management
│   │   ├── Reports.jsx         # Analytics & reports
│   │   └── Settings.jsx        # User preferences
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── style.css               # Global styles
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies
```

## 🔄 Workflow

1. **Login:** Examiners/Coordinators authenticate with credentials
2. **Dashboard:** View evaluation statistics and recent activity
3. **Scripts:** Browse and select scripts to evaluate
4. **Marking:** Use annotation tools and enter scores
5. **Reports:** Generate and analyze evaluation reports
6. **Settings:** Customize preferences and security settings

## 📋 CBSE OSM Compliance

This portal implements key features of the CBSE On-Screen Marking system:

- ✅ Digital script evaluation
- ✅ Scanned answer sheet viewing
- ✅ Annotation tools (tick, circle, underline, comments)
- ✅ Automated scoring
- ✅ Progress tracking
- ✅ Audit trails
- ✅ Multi-examiner support
- ✅ Coordinator oversight
- ✅ Comprehensive reporting
- ✅ Data security and compliance

## 🎓 Use Cases

### For Examiners:
- Efficiently evaluate answer scripts
- Use familiar marking tools
- Track personal progress
- Manage time effectively
- Submit scores securely

### For Coordinators:
- Monitor overall evaluation progress
- Track examiner performance
- Generate compliance reports
- Manage script distribution
- Ensure quality assurance

## 📞 Support

For issues or feature requests, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready
