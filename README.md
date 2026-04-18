# 💍 Wedding Invites - Full Stack Application

A modern, beautiful web application for creating, customizing, and managing wedding invitations online.

**Live Domain**: https://weddinginvites.online

---

## 📋 Project Overview

### Features
- 🎨 **Template Selection** - Choose from multiple beautiful templates
- 🖼️ **Image Upload** - Add custom photos and media
- ✏️ **Drag & Drop Editor** - Customize your invitation with ease
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎉 **RSVP Management** - Track guest responses
- 📧 **Email Notifications** - Automatic email delivery
- 💳 **Orders & Payments** - Create and manage orders
- 🔐 **Authentication** - Secure user accounts
- 📊 **Analytics** - Track invitation views and RSVPs

---

## 🏗️ Architecture

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: useInvitationState hook
- **Routing**: React Router v7
- **Deployment**: Vercel

**Location**: `./WEDINVITES/`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Zod
- **Deployment**: Vercel

**Location**: `./backend/`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Vercel account (for deployment)

### Local Development Setup

1. **Clone/Setup the project**
   ```bash
   # Backend setup
   cd backend
   npm install
   
   # Frontend setup
   cd ../WEDINVITES
   npm install
   ```

2. **Create environment files**
   See [ENV_SETUP.md](ENV_SETUP.md) for detailed instructions

3. **Run locally**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   # Runs on http://localhost:5000
   
   # Terminal 2 - Frontend
   cd WEDINVITES
   npm run dev
   # Runs on http://localhost:3000
   ```

4. **Test the connection**
   - Open http://localhost:3000
   - Open DevTools (F12)
   - Check Network tab for API calls
   - All calls should go to `http://localhost:5000/api/*`

---

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Invitation.js
│   │   │   ├── Order.js
│   │   │   └── RSVP.js
│   │   ├── controllers/             # Business logic
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Express middleware
│   │   ├── services/                # Reusable services
│   │   └── validators/              # Input validation
│   ├── .env                         # Environment variables (local)
│   ├── .env.example                 # Environment template
│   ├── vercel.json                  # Vercel deployment config
│   ├── package.json
│   └── README.md
│
├── WEDINVITES/
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Root component
│   │   ├── components/
│   │   │   ├── builder/             # Invitation builder components
│   │   │   ├── preview/             # Live preview components
│   │   │   ├── templates/           # Template selection
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   └── examples/            # Example components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/
│   │   │   ├── api.js               # Fetch-based API client
│   │   │   ├── axiosClient.js       # Axios-based API client
│   │   │   └── cn.js                # Utility functions
│   │   ├── data/
│   │   │   └── mockData.js          # Sample data
│   │   ├── App.css
│   │   └── index.css                # Global styles
│   ├── public/                      # Static files
│   ├── .env.local                   # Environment variables (local)
│   ├── .env.example                 # Environment template
│   ├── vercel.json                  # Vercel deployment config
│   ├── vite.config.js               # Vite configuration
│   ├── eslint.config.js
│   ├── package.json
│   └── README.md
│
├── SETUP_GUIDE.md                   # Detailed setup instructions
├── QUICKSTART.md                    # Quick 15-minute setup
├── ENV_SETUP.md                     # Environment variable guide
├── DEPLOYMENT_CHECKLIST.md          # Pre-launch checklist
└── README.md                        # This file
```

---

## 🔧 Configuration

### Environment Variables

See complete setup in [ENV_SETUP.md](ENV_SETUP.md)

**Backend (`backend/.env`)**:
```env
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-random-string>
NODE_ENV=production
FRONTEND_URL=https://weddinginvites.online
EMAIL_SERVICE=gmail
EMAIL_FROM=<your-email@gmail.com>
EMAIL_PASSWORD=<gmail-app-password>
```

**Frontend (`WEDINVITES/.env.local`)**:
```env
VITE_API_BASE_URL=https://api.weddinginvites.online
```

---

## 🌐 Deployment

### Vercel Deployment

#### Frontend
1. Push to GitHub
2. Create Vercel project from GitHub repo
3. Set environment variables
4. Add domain: `weddinginvites.online`

#### Backend
1. Push to GitHub
2. Create Vercel project from GitHub repo
3. Set environment variables
4. Add domain: `api.weddinginvites.online`

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete instructions.

---

## 📡 API Integration

### Using the API Client

```javascript
import { apiClient } from './utils/api';

// Login
const user = await apiClient.login(email, password);

// Create invitation
const invitation = await apiClient.createInvitation({
  coupleNames: 'John & Jane',
  eventDate: '2024-06-15',
  location: 'New York'
});

// Upload file
const result = await apiClient.uploadFile(file);
```

See [src/components/examples/ExampleComponents.jsx](WEDINVITES/src/components/examples/ExampleComponents.jsx) for more examples.

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login user
GET    /api/auth/me                 # Get current user
```

### Invitations
```
POST   /api/invitations             # Create invitation
GET    /api/invitations             # Get all invitations
GET    /api/invitations/:id         # Get specific invitation
PUT    /api/invitations/:id         # Update invitation
DELETE /api/invitations/:id         # Delete invitation
```

### Public
```
GET    /api/public/invitations/:slug # View public invitation
POST   /api/public/rsvp/:id         # Submit RSVP
```

### Uploads
```
POST   /api/uploads                 # Upload file
```

### Orders
```
POST   /api/orders                  # Create order
GET    /api/orders                  # Get all orders
```

Full API documentation in [backend/README.md](backend/README.md)

---

## 🧪 Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd WEDINVITES
npm run test
```

### Code Quality
```bash
# Lint frontend
cd WEDINVITES
npm run lint

# Format code
npm run format
```

---

## 📚 Documentation Files

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[QUICKSTART.md](QUICKSTART.md)** - 15-minute quick start
- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variable setup
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-launch checklist
- **[backend/README.md](backend/README.md)** - Backend documentation
- **[WEDINVITES/README.md](WEDINVITES/README.md)** - Frontend documentation

---

## 🔒 Security Features

- ✅ JWT authentication with secure tokens
- ✅ CORS protection with domain whitelist
- ✅ Content Security Policy (Helmet.js)
- ✅ Password hashing with bcryptjs
- ✅ MongoDB authentication required
- ✅ Rate limiting (recommended to add)
- ✅ Input validation with Zod
- ✅ HTTPS enforced in production
- ✅ Secure cookie handling

---

## 🚨 Troubleshooting

### Common Issues

**CORS Error**
- Check `FRONTEND_URL` in backend `.env`
- Verify `VITE_API_BASE_URL` in frontend `.env.local`

**MongoDB Connection Failed**
- Verify connection string is correct
- Check IP is whitelisted in MongoDB Atlas

**Email Not Sending**
- Use Gmail app-specific password
- Enable 2FA on Google account
- Check email is enabled in backend

**Images Not Uploading**
- Check `/uploads` directory exists
- Verify file permissions
- Check `MAX_FILE_SIZE` in `.env`

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for more troubleshooting.

---

## 📊 Performance Metrics

Target metrics for production:

| Metric | Target | Current |
|--------|--------|---------|
| Frontend Load Time | < 3s | TBD |
| API Response Time | < 500ms | TBD |
| Database Query Time | < 100ms | TBD |
| Image Load Time | < 1s | TBD |
| Lighthouse Score | > 90 | TBD |

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Apr 18, 2026 | Initial release |

---

## 📞 Support

### Getting Help
1. Check the documentation files
2. Review [QUICKSTART.md](QUICKSTART.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for troubleshooting
4. Review example code in [src/components/examples/](WEDINVITES/src/components/examples/)

### External Resources
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

## 📝 License

This project is proprietary and confidential.

---

## 👥 Contributors

- **Developer**: Hazee
- **Domain**: weddinginvites.online

---

## ✅ Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | 🔴 Not Deployed | https://weddinginvites.online |
| Backend | 🔴 Not Deployed | https://api.weddinginvites.online |
| Database | 🔴 Not Configured | MongoDB Atlas |

**Next Steps**:
1. Follow [ENV_SETUP.md](ENV_SETUP.md) to gather all credentials
2. Test locally using [QUICKSTART.md](QUICKSTART.md)
3. Deploy to Vercel following [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
4. Configure domain with DNS records
5. Launch and monitor!

---

**Created**: April 18, 2026
**Last Updated**: April 18, 2026
**Status**: Ready for Setup & Deployment

