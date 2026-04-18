# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- GitHub account (for Vercel deployment)
- Domain: weddinginvites.online

---

## 📋 Step-by-Step Setup (15 minutes)

### Step 1: Clone/Setup Project
```bash
cd backend
npm install

cd ../WEDINVITES
npm install
```

### Step 2: Create MongoDB Atlas Database
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user with username & password
4. Whitelist your IP
5. Copy connection string

### Step 3: Configure Backend Environment
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/wedding_invites?retryWrites=true&w=majority
JWT_SECRET=generate-strong-random-string-here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### Step 4: Configure Frontend Environment
Edit `WEDINVITES/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Step 5: Run Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd WEDINVITES
npm run dev
# App runs on http://localhost:3000
```

### Step 6: Test Connection
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Go to Network tab
4. Make a request to the app
5. Verify API calls go to http://localhost:5000/api/*

---

## 🌐 Deployment (Production)

### Using Vercel (Recommended)

#### Frontend Deployment:
```bash
cd WEDINVITES
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Go to https://vercel.com
# Import project
# Set environment variable:
# VITE_API_BASE_URL=https://api.weddinginvites.online
# Deploy
```

#### Backend Deployment:
```bash
cd backend
# Push to GitHub
git add .
git commit -m "Backend setup"
git push origin backend-main

# Go to https://vercel.com
# Import project
# Set environment variables:
MONGODB_URI=<your-mongodb-atlas-string>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
FRONTEND_URL=https://weddinginvites.online
EMAIL_SERVICE=gmail
EMAIL_FROM=<your-email>
EMAIL_PASSWORD=<app-password>
# Deploy
```

#### Custom Domain Setup:
1. Go to Vercel project settings
2. Add domain: `weddinginvites.online` (frontend)
3. Add domain: `api.weddinginvites.online` (backend)
4. Update DNS records at your registrar

---

## 📱 Using the App

### 1. Login
```javascript
import { apiClient } from './utils/api';

const result = await apiClient.login('email@example.com', 'password');
```

### 2. Create Invitation
```javascript
const invitation = await apiClient.createInvitation({
  coupleNames: 'John & Jane',
  eventDate: '2024-06-01',
  template: 'classic'
});
```

### 3. Upload Images
```javascript
const file = new File(['...'], 'image.jpg', { type: 'image/jpeg' });
const result = await apiClient.uploadFile(file);
```

### 4. Get Public Invitation
```javascript
const invitation = await apiClient.getPublicInvitation('john-jane-2024');
```

---

## 🔧 Available Commands

**Backend:**
```bash
npm run dev      # Development server with auto-reload
npm start        # Production server
npm run seed     # Seed database with sample data
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## 📋 Checklist

### Before Deployment:
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set
- [ ] Local testing works (login, create invite, upload)
- [ ] CORS configured for your domain
- [ ] Email service configured
- [ ] JWT secret set to strong random value

### After Deployment:
- [ ] Frontend loads without errors
- [ ] API calls work from frontend
- [ ] Database connections working
- [ ] Email notifications sent
- [ ] Images/uploads working
- [ ] Authentication working
- [ ] RSVP submissions working

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | /api/auth/login | ❌ |
| GET | /api/auth/me | ✅ |
| POST | /api/invitations | ✅ |
| GET | /api/invitations | ✅ |
| GET | /api/invitations/:id | ✅ |
| PUT | /api/invitations/:id | ✅ |
| DELETE | /api/invitations/:id | ✅ |
| POST | /api/uploads | ✅ |
| GET | /api/public/invitations/:slug | ❌ |
| POST | /api/public/rsvp/:id | ❌ |
| POST | /api/orders | ✅ |
| GET | /api/orders | ✅ |

---

## 🆘 Common Issues & Solutions

### ❌ CORS Error
**Problem:** "Access to XMLHttpRequest blocked by CORS policy"
**Solution:** 
- Check `FRONTEND_URL` in backend `.env`
- Verify `VITE_API_BASE_URL` in frontend `.env.local`
- Restart backend server

### ❌ MongoDB Connection Failed
**Problem:** "Cannot connect to MongoDB"
**Solution:**
- Verify connection string in `.env`
- Check IP is whitelisted in MongoDB Atlas
- Verify username/password are correct
- Check network connectivity

### ❌ API Returns 401
**Problem:** "Unauthorized"
**Solution:**
- Clear `auth_token` from localStorage
- Login again
- Check JWT_SECRET matches between backend and frontend

### ❌ Images Not Uploading
**Problem:** "Upload failed"
**Solution:**
- Check `/uploads` directory exists
- Verify file permissions
- Check MAX_FILE_SIZE in `.env`
- For production, use cloud storage (S3, Cloudinary)

---

## 📚 Documentation Files
- `SETUP_GUIDE.md` - Detailed setup instructions
- `backend/README.md` - Backend documentation
- `WEDINVITES/README.md` - Frontend documentation

---

## 🎯 Next Steps
1. ✅ Complete the Quick Start
2. ✅ Test locally
3. ✅ Deploy to Vercel
4. ✅ Configure custom domains
5. ✅ Set up email service
6. ✅ Optimize and monitor
7. ✅ Launch to users!

