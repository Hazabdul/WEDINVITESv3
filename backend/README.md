# Wedding Invitation App Backend

This is a production-ready Node.js backend for a Wedding Invitation Builder application.

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Auth**: JWT & Bcryptjs
- **Uploads**: Multer
- **Email**: Nodemailer
- **Validation**: Zod

## Features
- **Admin System**: Login, protected routes, dashboard data management.
- **Invitation Builder**: CRUD for drafts, embedded subdocuments for events/widgets.
- **Publishing Workflow**: Slug generation and public access control.
- **RSVP System**: Public collection per invitation.
- **Payment tracking**: Order collection with manual verification flow.

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your MONGODB_URI
```

### 4. Database Setup
```bash
npm run seed
```

### 5. Running the App
```bash
# Development mode
npm run dev

# Production mode
npm run start
```

## API Documentation

### Auth
- `POST /api/auth/login`: `{ email, password }` -> returns `{ token, user }`
- `GET /api/auth/me`: Returns current user profile (Requires JWT)

### Invitations (Admin)
- `GET /api/invitations`: List all invitations
- `POST /api/invitations`: Create a new blank draft
- `GET /api/invitations/:id`: Get full invitation details including RSVPs
- `PATCH /api/invitations/:id`: Update invitation content (Draft autosave)
- `DELETE /api/invitations/:id`: Archive invitation
- `POST /api/invitations/:id/publish`: Mark as live and generate slug
- `POST /api/invitations/:id/unpublish`: Revert to draft

### Public Access
- `GET /api/public/invitations/:slug`: Fetch public invitation data for guests
- `POST /api/public/invitations/:slug/rsvp`: Submit RSVP

### Orders & Payments
- `POST /api/orders`: Create a checkout record
- `PATCH /api/orders/:id/verify-payment`: (Admin) Confirm payment and send email

### Uploads
- `POST /api/uploads`: Upload file (multipart/form-data)

---

## Example Payloads

### Update Invitation (Autosave)
**PATCH** `/api/invitations/:id`
```json
{
  "brideName": "Alice",
  "groomName": "Bob",
  "content": {
    "welcomeHeading": "Hi Everyone!",
    "introMessage": "Welcome to our page"
  },
  "theme": {
    "primaryColor": "#ff5733",
    "font": "Roboto"
  },
  "events": [
    { "name": "Dinner", "venue": "Grand Hall", "date": "2026-05-10" }
  ]
}
```

### Submit RSVP
**POST** `/api/public/invitations/alice-and-bob/rsvp`
```json
{
  "guestName": "John Doe",
  "email": "john@example.com",
  "attending": true,
  "guestCount": 2,
  "message": "Can't wait!"
}
```

### Verify Payment
**PATCH** `/api/orders/:id/verify-payment`
```json
{
  "transactionId": "TXN_123456789"
}
```
