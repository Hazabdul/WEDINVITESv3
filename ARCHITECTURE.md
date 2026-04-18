# 🏗️ Architecture & Deployment Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Internet Users                              │
│                                                                   │
│          ┌──────────────────────────────────────┐               │
│          │    weddinginvites.online (Domain)    │               │
│          └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DNS Resolution                              │
│                                                                   │
│  @ → 76.76.19.20 (Vercel)      api → cname.vercel.com          │
└─────────────────────────────────────────────────────────────────┘
     ▼                                      ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   FRONTEND (Vercel)      │   │  BACKEND (Vercel)        │
│                          │   │                          │
│  ┌────────────────────┐  │   │  ┌────────────────────┐  │
│  │   React App        │  │   │  │  Node.js/Express   │  │
│  │  ✓ UI Components   │  │   │  │  ✓ API Routes      │  │
│  │  ✓ State Mgmt      │  │   │  │  ✓ Auth Logic      │  │
│  │  ✓ Routing         │  │   │  │  ✓ File Upload     │  │
│  │  ✓ API Client      │  │   │  │  ✓ Email Service   │  │
│  └────────────────────┘  │   │  └────────────────────┘  │
│                          │   │                          │
│  Build: npm run build    │   │  Runtime: node src/...   │
│  Port: 3000 (local)      │   │  Port: 5000 (local)      │
└──────────────────────────┘   └──────────────────────────┘
          │                               │
          │                               │
          └───────────────┬───────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │   API Communication (REST/JSON)   │
        │                                   │
        │  GET  /api/invitations            │
        │  POST /api/auth/login             │
        │  PUT  /api/invitations/:id        │
        │  POST /api/uploads                │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  MongoDB Atlas (Cloud Database)   │
        │                                   │
        │  ┌─────────────────────────────┐ │
        │  │ Collections:                │ │
        │  │ • users                     │ │
        │  │ • invitations               │ │
        │  │ • rsvps                     │ │
        │  │ • orders                    │ │
        │  └─────────────────────────────┘ │
        └─────────────────────────────────┘

                External Services:
        ┌─────────────────┐  ┌─────────────────┐
        │  Gmail (SMTP)   │  │  Cloud Storage  │
        │  Email Service  │  │  (Optional)     │
        └─────────────────┘  └─────────────────┘
```

---

## Technology Stack

### Frontend
```
React 19
  ├── React Router 7 (Page routing)
  ├── Tailwind CSS 4 (Styling)
  ├── Vite 8 (Build tool)
  ├── Axios (Optional HTTP client)
  └── Lucide React (Icons)
```

### Backend
```
Node.js + Express
  ├── MongoDB (Database)
  ├── Mongoose (ODM)
  ├── JWT (Authentication)
  ├── Multer (File uploads)
  ├── Nodemailer (Email)
  ├── Zod (Validation)
  ├── Helmet (Security)
  └── CORS (Cross-origin)
```

### Infrastructure
```
Vercel
  ├── Frontend Hosting
  ├── Backend Serverless Functions
  ├── Database: MongoDB Atlas
  ├── Email: Gmail SMTP
  └── Domain: Custom (.online)
```

---

## Request/Response Flow

### User Login Flow
```
1. User enters credentials
   ▼
2. Frontend → POST /api/auth/login
   ▼
3. Backend validates credentials (bcrypt)
   ▼
4. Database query (find user)
   ▼
5. Generate JWT token
   ▼
6. Return token to frontend
   ▼
7. Frontend stores in localStorage
   ▼
8. Include in Authorization header for future requests
```

### Create Invitation Flow
```
1. User fills form
   ▼
2. Frontend collects data
   ▼
3. Upload images to /api/uploads (Multer)
   ▼
4. POST /api/invitations with template data
   ▼
5. Backend validates with Zod
   ▼
6. Save to MongoDB
   ▼
7. Return invitation ID & metadata
   ▼
8. Frontend navigates to preview
   ▼
9. Generate shareable link (slug)
```

### Public RSVP Flow
```
1. Guest visits public link
   ▼
2. Frontend → GET /api/public/invitations/:slug
   ▼
3. Backend returns invitation template
   ▼
4. Frontend renders template
   ▼
5. Guest fills RSVP form
   ▼
6. POST /api/public/rsvp/:id
   ▼
7. Backend saves RSVP to MongoDB
   ▼
8. Send email notification to couple
   ▼
9. Return success message to guest
```

---

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (ADMIN),
  createdAt: Date,
  updatedAt: Date
}
```

### Invitation Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  coupleNames: String,
  eventDate: Date,
  location: String,
  template: String,
  theme: Object,
  content: {
    familyContent: String,
    specialInstructions: String,
  },
  media: [
    {
      url: String,
      type: String (image/video),
    }
  ],
  slug: String (unique, SEO-friendly),
  isPublished: Boolean,
  rsvpSettings: {
    allowRSVP: Boolean,
    deadline: Date,
  },
  createdAt: Date,
  updatedAt: Date
}
```

### RSVP Schema
```javascript
{
  _id: ObjectId,
  invitationId: ObjectId,
  guestName: String,
  guestEmail: String,
  attending: Boolean,
  dietaryRestrictions: String,
  plusOnes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  invitationId: ObjectId,
  amount: Number,
  currency: String,
  status: String (pending/completed/failed),
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────┐
│   Developer Machine (Local)     │
│                                 │
│  Backend:       Frontend:       │
│  localhost:5000 localhost:3000  │
│                                 │
│  ↓ Git Push                     │
│  GitHub Repository              │
└─────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────────────┐
│           Vercel Platform (Cloud)               │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │   Frontend CDN   │  │  Backend Runtime │   │
│  │                  │  │                  │   │
│  │ React Build: /   │  │ Node.js Runtime  │   │
│  │ Static Files     │  │ Express Server   │   │
│  │ Edge Network     │  │ Serverless Funcs │   │
│  │                  │  │ Auto-scaling     │   │
│  └──────────────────┘  └──────────────────┘   │
│           │                     │              │
│           │   API Communication │              │
│           └─────────┬───────────┘              │
└─────────────────────┼──────────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  MongoDB Atlas (Cloud DB)  │
        │  • Automated backups       │
        │  • Replication             │
        │  • Auto-scaling            │
        │  • 99.99% uptime           │
        └────────────────────────────┘
```

---

## Environment Variables Flow

### Local Development
```
.env (not in Git)
  ├── MONGODB_URI → mongodb://localhost:27017
  ├── JWT_SECRET → local-dev-secret
  ├── NODE_ENV → development
  ├── FRONTEND_URL → http://localhost:3000
  └── EMAIL_* → test-credentials

.env.local (not in Git)
  └── VITE_API_BASE_URL → http://localhost:5000
```

### Production (Vercel)
```
Vercel Environment Variables
  (Set in Vercel Dashboard, not in Git)
  
Backend Project:
  ├── MONGODB_URI → mongodb+srv://user:pass@cluster...
  ├── JWT_SECRET → strong-production-secret
  ├── NODE_ENV → production
  ├── FRONTEND_URL → https://weddinginvites.online
  └── EMAIL_* → production-gmail-credentials

Frontend Project:
  └── VITE_API_BASE_URL → https://api.weddinginvites.online
```

---

## Security Flow

### Authentication
```
1. User Login
   ├── POST /api/auth/login
   ├── Validate credentials
   ├── Generate JWT token
   └── Return token
   
2. Subsequent Requests
   ├── Add token to Authorization header
   ├── Backend validates JWT
   ├── Check token expiration
   └── Proceed if valid
   
3. Token Storage
   ├── localStorage (frontend)
   ├── HttpOnly cookies (optional)
   └── Expires after TTL
```

### Authorization
```
Public Endpoints:
  • GET /api/public/invitations/:slug
  • POST /api/public/rsvp/:id
  
Protected Endpoints (Require JWT):
  • GET /api/auth/me
  • POST /api/invitations
  • GET /api/invitations
  • PUT /api/invitations/:id
  • DELETE /api/invitations/:id
  • POST /api/uploads
  • POST /api/orders
```

---

## Scaling Considerations

### Horizontal Scaling
```
Current: Single instances (suitable for < 10k users)

Future Growth:
├── Load Balancer (distribute traffic)
├── Multiple Backend Instances
├── Backend Caching (Redis)
├── Database Read Replicas
└── CDN for static assets
```

### Database Optimization
```
Current: MongoDB Atlas M0 (free tier)

Growth Path:
├── M2 Cluster (shared, ~$10/month)
├── M10 Cluster (dedicated, ~$60/month)
├── Sharding (>100 million documents)
└── Analytics (separate cluster)
```

---

## Monitoring & Logging

### Frontend Monitoring
```
Vercel Analytics:
  • Page load times
  • Core Web Vitals
  • Error tracking
  • User analytics

Optional:
  • Sentry (error tracking)
  • LogRocket (session replay)
  • Datadog (performance)
```

### Backend Monitoring
```
Vercel Functions:
  • Execution duration
  • Memory usage
  • Error logs
  • Request logs

Recommended:
  • MongoDB Atlas monitoring
  • Email delivery tracking
  • API uptime monitoring
```

---

## API Rate Limiting (Recommended)

```
Public Endpoints:
  • 100 requests/hour per IP

Authentication:
  • 5 login attempts/minute per IP
  • 20 requests/minute per user

Upload Endpoints:
  • 10 uploads/minute per user
  • Max file size: 5MB

RSVP Endpoints:
  • 1 submission per guest email
  • 100 submissions/minute per invitation
```

---

## Disaster Recovery Plan

### Data Backup
```
MongoDB Atlas:
  • Automatic daily backups
  • 7-day retention
  • Manual snapshots possible
  • Restore to point-in-time
```

### Application Backup
```
GitHub:
  • Source code versioning
  • Deployment rollback capability
  • Release/tag system
  • Automated CI/CD
```

### Communication
```
In Case of Outage:
  • Use StatusPage.io (optional)
  • Email users directly
  • Post on social media
  • Update DNS if needed
```

---

## Cost Estimation (Monthly)

```
Vercel:
  • Frontend hosting (included in free tier)
  • Backend functions (pay-as-you-go)
  • Estimated: $5-20/month

MongoDB Atlas:
  • M0 Cluster (free tier): $0
  • M2 Cluster: ~$10
  • Estimated: $0-10/month

Gmail:
  • SMTP (included): $0

Domain:
  • .online domain: ~$10
  • Estimated: $10/year

Total: $0-40/month
```

---

## Upgrade Path

```
Phase 1: Launch (Current)
├── Demo mode
├── Limited users
└── Free tier services

Phase 2: Growth (3-6 months)
├── Premium templates
├── Advanced customization
├── Paid features
└── Upgrade to paid tiers

Phase 3: Scale (6-12 months)
├── Mobile apps
├── Multiple languages
├── Advanced analytics
└── Enterprise features
```

---

**Architecture Document Version**: 1.0
**Last Updated**: April 18, 2026
**Status**: Ready for Production

