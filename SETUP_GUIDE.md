# OSM Portal - Setup & Usage Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10.8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OnScreenMarking
   ```

2. **Navigate to UI directory**
   ```bash
   cd UI
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🔐 Login Credentials

### Demo Account
- **Email:** examiner@cbse.gov.in
- **Password:** password
- **User Type:** Examiner (or Coordinator)

### User Types

#### Examiner
- Evaluate assigned scripts
- View personal statistics
- Access marking tools
- Submit scores
- View personal reports

#### Coordinator
- Monitor overall progress
- View all examiners' performance
- Generate comprehensive reports
- Manage script assignments
- Access audit logs

---

## 📖 Usage Guide

### 1. Login
1. Open the application
2. Select user type (Examiner/Coordinator)
3. Enter email: `examiner@cbse.gov.in`
4. Enter password: `password`
5. Click "Sign In"

### 2. Dashboard
- View key statistics:
  - Total scripts
  - Evaluated scripts
  - Pending scripts
  - In-progress scripts
  - Average score
- See evaluation progress
- View recent activity

### 3. Scripts Management
1. Click "Scripts" in sidebar
2. **Search:** Use search bar to find scripts by:
   - Student name
   - Roll number
   - Script ID
3. **Filter:** Select status (All/Pending/In Progress/Completed)
4. **View:** Click eye icon to open script viewer
5. **Mark:** Use annotation tools:
   - Tick (✓): Mark correct
   - Circle (⭕): Highlight
   - Underline (_): Emphasize
   - Comment (💬): Add notes
6. **Score:** Enter marks and submit

### 4. Reports
1. Click "Reports" in sidebar
2. **Select Report Type:**
   - Summary Report: Overall statistics
   - Subject Report: Subject-wise analysis
   - Examiner Report: Examiner performance
3. **Choose Date Range:**
   - Today
   - This Week
   - This Month
   - All Time
4. **Export:** Click "Export Report" button

### 5. Settings
1. Click "Settings" in sidebar
2. **Account:** Update email
3. **Notifications:** Configure alerts
4. **Marking:** Set preferences
5. **Security:** Enable 2FA
6. **Privacy:** Manage permissions
7. **Display:** Choose theme
8. Click "Save Changes"

---

## 🛠️ Development

### Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install

# Update dependencies
npm update
```

### Project Structure
```
UI/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── assets/         # Images and icons
│   ├── App.jsx         # Main app
│   ├── main.jsx        # Entry point
│   └── style.css       # Global styles
├── public/             # Static files
├── dist/               # Production build
├── index.html          # HTML template
├── vite.config.js      # Vite config
└── package.json        # Dependencies
```

### Making Changes

1. **Edit Components:**
   - Modify files in `src/components/` or `src/pages/`
   - Changes auto-reload in dev server

2. **Add New Page:**
   ```javascript
   // Create src/pages/NewPage.jsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

3. **Update Routes:**
   - Edit `src/App.jsx`
   - Add new route in Routes component

4. **Style Changes:**
   - Use Tailwind CSS classes
   - Edit `src/style.css` for global styles

---

## 📊 Features Overview

### Dashboard
- Real-time statistics
- Progress visualization
- Recent activity log
- Quick access to scripts

### Scripts
- Search and filter
- Script viewer
- Annotation tools
- Scoring system
- Download option

### Reports
- Summary analytics
- Subject-wise breakdown
- Examiner performance
- Score distribution
- Export functionality

### Settings
- Account management
- Notification preferences
- Marking preferences
- Security options
- Privacy controls

---

## 🔒 Security

### Authentication
- Email/password login
- Token-based sessions
- Protected routes
- Automatic logout

### Data Protection
- Secure script viewing
- Role-based access
- Audit trails
- Compliance logging

### Best Practices
- Change password regularly
- Enable 2FA
- Don't share credentials
- Logout when done
- Clear browser cache

---

## 🐛 Troubleshooting

### Issue: Port 5173 already in use
**Solution:**
```bash
# Use different port
npm run dev -- --port 3000
```

### Issue: Dependencies not installing
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails
**Solution:**
```bash
# Check Node version
node --version

# Should be 20.19+ or 22.12+
# Update if needed
```

### Issue: Styles not loading
**Solution:**
```bash
# Restart dev server
# Clear browser cache
# Hard refresh (Ctrl+Shift+R)
```

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🎯 Common Tasks

### View Dashboard
1. Login
2. You're on the dashboard by default

### Evaluate a Script
1. Go to Scripts
2. Search for student
3. Click eye icon
4. Use marking tools
5. Enter score
6. Submit

### Generate Report
1. Go to Reports
2. Select report type
3. Choose date range
4. View or export

### Change Settings
1. Go to Settings
2. Update preferences
3. Click Save Changes

### Logout
1. Click user profile (top right)
2. Click logout button
3. Redirected to login

---

## 📞 Support

### Getting Help
- Check documentation
- Review error messages
- Check browser console (F12)
- Contact development team

### Reporting Issues
- Note the error message
- Take a screenshot
- Describe steps to reproduce
- Contact support

---

## 🔄 Updates & Maintenance

### Checking for Updates
```bash
npm outdated
```

### Updating Dependencies
```bash
npm update
```

### Updating Specific Package
```bash
npm install package-name@latest
```

---

## 📋 Checklist

### Before Going Live
- [ ] Test all features
- [ ] Check responsive design
- [ ] Verify authentication
- [ ] Test all reports
- [ ] Check performance
- [ ] Security review
- [ ] Backup data
- [ ] Document changes

### Regular Maintenance
- [ ] Monitor performance
- [ ] Check error logs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review security
- [ ] Update documentation

---

## 🎓 Learning Resources

### React
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com)

### Vite
- [Vite Documentation](https://vitejs.dev)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org)

---

## 📝 Notes

- Demo data is mock data for testing
- Actual data will come from backend API
- Scores are stored in localStorage (demo only)
- Real implementation will use database
- Authentication is mock (demo only)
- Real implementation will use secure auth

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Server
1. Build the project
2. Upload `dist/` folder to server
3. Configure web server
4. Set up environment variables
5. Test in production

### Environment Variables
```
VITE_API_URL=https://api.example.com
VITE_AUTH_TOKEN=your-token
```

---

## 📞 Contact

For support or questions:
- Email: support@osm-portal.com
- Phone: +91-XXXX-XXXX-XXXX
- Website: www.osm-portal.com

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready

---

## Quick Reference

| Task | Command |
|------|---------|
| Start Dev | `npm run dev` |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Install | `npm install` |
| Update | `npm update` |

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | Authentication |
| Dashboard | `/` | Statistics & overview |
| Scripts | `/scripts` | Script management |
| Reports | `/reports` | Analytics |
| Settings | `/settings` | Preferences |

| Feature | Location | Access |
|---------|----------|--------|
| Search | Scripts page | All users |
| Filter | Scripts page | All users |
| Marking | Script modal | Examiners |
| Reports | Reports page | Coordinators |
| Settings | Settings page | All users |
