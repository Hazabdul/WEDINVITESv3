# Admin Backend Readout and Implementation Plan

This document is based on the inspected repository state on 2026-04-28.

## 1. Project Purpose and Main Modules

The project is a full stack wedding invitation builder. The public frontend lets a couple build a digital invitation, upload media, publish a shareable invitation URL, and view the published invitation. The backend is an Express/MongoDB API that stores invitations, RSVPs, orders, users, uploaded files, email notifications, and AI-assisted image workflows.

Main modules:

- `frontend/src/pages`: public pages, builder, pricing, invitation viewer, AI analyzer, and image-to-website tool.
- `frontend/src/components/preview` and `frontend/src/components/templates`: render the live invitation experience.
- `frontend/src/hooks/useInvitationState.jsx`: local builder state for couple details, event data, content, media, theme, positions, and package.
- `frontend/src/utils/api.js`: active fetch-based API client used by current pages.
- `backend/src/index.js`: Express app setup, CORS, Helmet, static uploads, and route mounting.
- `backend/src/models`: MongoDB collections for `User`, `Invitation`, `RSVP`, `Order`, and now `SiteConfig`.
- `backend/src/controllers`: route handlers for auth, invitation CRUD, public invitation access, orders, uploads, metadata/config, AI tools, and now admin APIs.
- `backend/src/middleware`: JWT auth, RBAC helpers, and centralized error handling.
- `backend/src/validators`: Zod validation for auth, invitation, RSVP, admin, order, user, and config payloads.

## 2. Current Frontend/Admin Panel Structure

There is no active admin panel route in `frontend/src/App.jsx`. Current routes are:

- `/`
- `/builder`
- `/templates`
- `/pricing`
- `/invitation-analyzer`
- `/image-to-website`
- `/invitation/:slug`, `/invite/:slug`, `/v/:slug`

Admin-like example components exist in `frontend/src/components/examples/ExampleComponents.jsx`, but they are not wired into the app router. The live builder currently publishes without a login by calling:

- `POST /api/invitations`
- `PATCH /api/invitations/:id`
- `POST /api/invitations/:id/publish`
- `POST /api/uploads`

For compatibility, those public builder endpoints remain available. Protected admin APIs were added under `/api/admin/*` so a future admin panel can use auth and RBAC without breaking the current public builder.

## 3. Existing API Calls, Models, Auth, Roles, and Permissions

Active frontend API client: `frontend/src/utils/api.js`.

Existing frontend calls:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/invitations`
- `GET /api/invitations`
- `GET /api/invitations/:id`
- `PATCH /api/invitations/:id`
- `POST /api/invitations/:id/publish`
- `POST /api/invitations/:id/unpublish`
- `DELETE /api/invitations/:id`
- `POST /api/uploads`
- `POST /api/analyze-invitation`
- `POST /api/generate-template`
- `POST /api/image-to-website`
- `GET /api/public/invitations/:slug`
- `GET /api/public/invitations?page=1&limit=6`
- `POST /api/public/invitations/:slug/rsvp`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/config`
- `PUT /api/config`

Data models:

- `User`: `email`, `password`, `name`, `role`, `status`, `lastLoginAt`.
- `Invitation`: `email`, `customerEmail`, `brideName`, `groomName`, `weddingDate`, `status`, `package`, `paymentStatus`, JSON content blobs, media, events, widgets, slug, view stats, timestamps.
- `RSVP`: `invitationId`, `guestName`, `email`, `phone`, `attending`, `guestCount`, `message`.
- `Order`: `invitationId`, `customerEmail`, `customerName`, `package`, `amount`, `currency`, `paymentMethod`, `transactionId`, `status`, verification metadata.
- `SiteConfig`: singleton site/admin configuration for public config, payment details, branding, SEO, and support contacts.

Auth flow:

1. Admin logs in with `POST /api/auth/login`.
2. Backend validates password using bcrypt.
3. Backend returns JWT plus flat user fields and a nested `user` object.
4. Frontend stores `auth_token` in `localStorage`.
5. Protected requests include `Authorization: Bearer <token>`.

Roles and permissions:

- `OWNER` and `ADMIN`: full access.
- `EDITOR`: dashboard read, invitation write, RSVP write, order read, upload write, config read.
- `VIEWER`: dashboard read, invitation read, RSVP read, order read, config read.

## 4. Database and Storage Usage

Database: MongoDB through Mongoose. The backend expects `MONGODB_URI`. `Invitation`, `RSVP`, and `SiteConfig` include a development in-memory fallback when `NODE_ENV=development` and MongoDB is unavailable or not configured.

File storage: Multer writes uploaded files to `backend/src/uploads` and serves them from `/uploads`. This works locally and on persistent hosts, but it is not reliable for serverless deployments because local files may disappear between deployments or function instances. For production, replace this with Cloudinary, S3, or another persistent object store while keeping the same response shape: `{ url, filename, mimetype, size }`.

AI:

- Invitation analyzer uses local OCR and image analysis through `tesseract.js` and `sharp`.
- Image-to-website uses OpenAI Responses API when `OPENAI_API_KEY` is configured.

## 5. Missing Backend Features Needed for the Admin Panel

Before this implementation:

- No active protected `/api/admin` API namespace.
- Invitation admin routes were unprotected for builder testing.
- No `/api/config` implementation even though the frontend client already had methods for it.
- No dashboard/statistics endpoint.
- No admin user management.
- No protected admin media upload endpoint.
- No RSVP notification email despite architecture docs mentioning it.
- No legacy `/api/public/rsvp/:id` route despite older docs and axios client referencing it.
- No consistent RBAC helper beyond `adminOnly`.
- No cURL/Postman-ready endpoint examples for admin APIs.

Implemented now:

- Protected `/api/admin` namespace.
- Dashboard stats and recent activity.
- Paginated admin invitation, RSVP, order, and user APIs.
- Site config model and `/api/config`.
- RBAC helpers and role permissions.
- Admin upload endpoint.
- RSVP email notification hook.
- Legacy RSVP route alias.
- PUT alias for invitation updates.

Still recommended for production:

- Rate limiting for login, public RSVP, uploads, and AI endpoints.
- Persistent object storage.
- Audit log collection for admin mutations.
- Optional guest list import/export.
- Real payment gateway integration if manual UPI verification is not enough.
- Frontend admin panel routes and screens.

## Backend Implementation Plan

### Required Collections

- `users`: admin/operator accounts.
- `invitations`: invitation documents, publish state, payment state, view stats, content, media, theme, event blocks.
- `rsvps`: guest responses per invitation.
- `orders`: payment/order records and verification metadata.
- `siteconfigs`: singleton site/admin settings.

Optional future collections:

- `mediaassets`: persistent media library metadata when moving uploads to Cloudinary/S3.
- `auditlogs`: who changed what and when.
- `notifications`: durable email/chat/notification status.

### REST API Endpoints

Public/current compatibility endpoints:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/invitations`
- `GET /api/invitations`
- `GET /api/invitations/:id`
- `PATCH /api/invitations/:id`
- `PUT /api/invitations/:id`
- `DELETE /api/invitations/:id`
- `POST /api/invitations/:id/publish`
- `POST /api/invitations/:id/unpublish`
- `GET /api/invitations/:id/rsvps`
- `GET /api/public/invitations`
- `GET /api/public/invitations/:slug`
- `POST /api/public/invitations/:slug/rsvp`
- `POST /api/public/rsvp/:id`
- `POST /api/uploads`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/verify-payment`
- `GET /api/templates`
- `GET /api/packages`
- `GET /api/config`
- `PUT /api/config`
- `POST /api/analyze-invitation`
- `POST /api/generate-template`
- `POST /api/image-to-website`

Admin endpoints:

- `GET /api/admin/dashboard`
- `GET /api/admin/invitations`
- `GET /api/admin/invitations/:id`
- `PATCH /api/admin/invitations/:id`
- `POST /api/admin/invitations/:id/publish`
- `POST /api/admin/invitations/:id/unpublish`
- `POST /api/admin/invitations/:id/archive`
- `GET /api/admin/rsvps`
- `PATCH /api/admin/rsvps/:id`
- `DELETE /api/admin/rsvps/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/verify-payment`
- `GET /api/admin/config`
- `PUT /api/admin/config`
- `POST /api/admin/uploads`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`

### Validation Rules

- Login: valid email, password min 6.
- Admin user creation: valid email, password min 8, role in `OWNER|ADMIN|EDITOR|VIEWER`, status in `ACTIVE|DISABLED`.
- Invitations: package in `BASIC|STANDARD|PREMIUM`, status in `DRAFT|PUBLISHED|ARCHIVED`, payment status in `PENDING|PAID|FAILED`, valid contact email if supplied.
- RSVP: required `guestName`, required boolean `attending`, optional valid email, `guestCount >= 1`.
- Orders: valid invitation id string, valid customer email, package enum, amount >= 0, currency length 3.
- Config: strict known top-level fields only.
- Uploads: JPG, PNG, WebP, MP4, MP3. Size controlled by `MAX_FILE_SIZE`.

### File and Media Upload Handling

Current:

- `POST /api/uploads`
- `POST /api/admin/uploads`
- Multipart field name: `file`.
- Response includes `url`, `filename`, `mimetype`, and `size`.

Production recommendation:

- Keep the response contract, but swap local disk storage for Cloudinary/S3.
- Store durable media metadata in a `mediaassets` collection if the admin panel needs search, delete, or usage tracking.

### Notifications, Chat, and Reporting

Present:

- Payment confirmation email after admin verification.
- RSVP notification email to invitation `email` or `customerEmail`.
- Dashboard counts for invitations, orders, RSVPs, and revenue.
- Basic invitation `viewCount` and `lastViewedAt`.

Not present:

- Chat system.
- Durable notification log.
- Advanced analytics by day/source/device.

Recommended:

- Add `auditlogs` for admin changes.
- Add `notifications` if delivery state must be visible in admin.
- Add analytics events if reporting needs charts over time.

### Response Format

Existing compatibility endpoints return raw objects/arrays where the frontend already expects them.

New admin endpoints use:

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0,
    "hasMore": false
  }
}
```

Errors use:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

### Folder Structure

```text
backend/src
  config/db.js
  controllers/
    adminController.js
    authController.js
    configController.js
    invitationController.js
    orderController.js
    publicController.js
    uploadController.js
  middleware/
    auth.js
    errorHandler.js
  models/
    Invitation.js
    Order.js
    RSVP.js
    SiteConfig.js
    User.js
  routes/
    adminRoutes.js
    authRoutes.js
    invitationRoutes.js
    metaRoutes.js
    orderRoutes.js
    publicRoutes.js
    uploadRoutes.js
  services/
    authService.js
    emailService.js
  validators/
    adminValidator.js
    authValidator.js
    invitationValidator.js
```

### Environment Variables

Required:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

Email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Uploads:

- `UPLOAD_PATH`
- `MAX_FILE_SIZE`

AI:

- `OPENAI_API_KEY`
- `OPENAI_UI_MODEL`

### Security Considerations

- Use strong `JWT_SECRET`.
- Do not expose admin routes without HTTPS.
- Add rate limiting before production.
- Move media from local disk to persistent object storage.
- Keep `FRONTEND_URL` and CORS origins strict.
- Store admin JWTs carefully on the frontend. HttpOnly cookies are safer than localStorage for a production admin panel.
- Do not enable public create/update invitation APIs for paid production unless the product intentionally allows no-login publishing.
- Add audit logs before allowing multiple operators to mutate payments or invitations.

## cURL Examples

Set variables:

```bash
BASE_URL=http://localhost:5000
TOKEN=replace_with_jwt
INVITATION_ID=replace_with_invitation_id
ORDER_ID=replace_with_order_id
RSVP_ID=replace_with_rsvp_id
USER_ID=replace_with_user_id
```

Auth:

```bash
curl -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
curl "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
```

Config:

```bash
curl "$BASE_URL/api/config"
curl -X PUT "$BASE_URL/api/config" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"siteName\":\"Wedding Invites\",\"maintenanceMode\":false}"
```

Admin dashboard:

```bash
curl "$BASE_URL/api/admin/dashboard" -H "Authorization: Bearer $TOKEN"
```

Admin invitations:

```bash
curl "$BASE_URL/api/admin/invitations?page=1&limit=20&status=PUBLISHED" -H "Authorization: Bearer $TOKEN"
curl "$BASE_URL/api/admin/invitations/$INVITATION_ID" -H "Authorization: Bearer $TOKEN"
curl -X PATCH "$BASE_URL/api/admin/invitations/$INVITATION_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"brideName\":\"Aaliyah\",\"groomName\":\"Omar\",\"email\":\"couple@example.com\"}"
curl -X POST "$BASE_URL/api/admin/invitations/$INVITATION_ID/publish" -H "Authorization: Bearer $TOKEN"
curl -X POST "$BASE_URL/api/admin/invitations/$INVITATION_ID/unpublish" -H "Authorization: Bearer $TOKEN"
curl -X POST "$BASE_URL/api/admin/invitations/$INVITATION_ID/archive" -H "Authorization: Bearer $TOKEN"
```

Admin RSVPs:

```bash
curl "$BASE_URL/api/admin/rsvps?page=1&limit=20&invitationId=$INVITATION_ID" -H "Authorization: Bearer $TOKEN"
curl -X PATCH "$BASE_URL/api/admin/rsvps/$RSVP_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"guestCount\":2,\"message\":\"Updated by admin\"}"
curl -X DELETE "$BASE_URL/api/admin/rsvps/$RSVP_ID" -H "Authorization: Bearer $TOKEN"
```

Admin orders:

```bash
curl "$BASE_URL/api/admin/orders?page=1&limit=20&status=PENDING" -H "Authorization: Bearer $TOKEN"
curl -X PATCH "$BASE_URL/api/admin/orders/$ORDER_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"notes\":\"Manual follow-up needed\"}"
curl -X PATCH "$BASE_URL/api/admin/orders/$ORDER_ID/verify-payment" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"transactionId\":\"UTR12345678\"}"
```

Admin users:

```bash
curl "$BASE_URL/api/admin/users" -H "Authorization: Bearer $TOKEN"
curl -X POST "$BASE_URL/api/admin/users" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"email\":\"viewer@example.com\",\"password\":\"password123\",\"name\":\"Viewer\",\"role\":\"VIEWER\"}"
curl -X PATCH "$BASE_URL/api/admin/users/$USER_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"role\":\"EDITOR\",\"status\":\"ACTIVE\"}"
```

Uploads:

```bash
curl -X POST "$BASE_URL/api/uploads" -F "file=@./sample.jpg"
curl -X POST "$BASE_URL/api/admin/uploads" -H "Authorization: Bearer $TOKEN" -F "file=@./sample.jpg"
```

Current invitation builder endpoints:

```bash
curl -X POST "$BASE_URL/api/invitations" -H "Content-Type: application/json" -d "{}"
curl "$BASE_URL/api/invitations"
curl "$BASE_URL/api/invitations/$INVITATION_ID"
curl -X PATCH "$BASE_URL/api/invitations/$INVITATION_ID" -H "Content-Type: application/json" -d "{\"brideName\":\"Aaliyah\",\"groomName\":\"Omar\"}"
curl -X PUT "$BASE_URL/api/invitations/$INVITATION_ID" -H "Content-Type: application/json" -d "{\"brideName\":\"Aaliyah\"}"
curl -X POST "$BASE_URL/api/invitations/$INVITATION_ID/publish"
curl -X POST "$BASE_URL/api/invitations/$INVITATION_ID/unpublish"
curl -X DELETE "$BASE_URL/api/invitations/$INVITATION_ID"
curl "$BASE_URL/api/invitations/$INVITATION_ID/rsvps"
```

Public invitation and RSVP:

```bash
curl "$BASE_URL/api/public/invitations?page=1&limit=6"
curl "$BASE_URL/api/public/invitations/alice-and-bob"
curl -X POST "$BASE_URL/api/public/invitations/alice-and-bob/rsvp" -H "Content-Type: application/json" -d "{\"guestName\":\"Sara\",\"email\":\"sara@example.com\",\"attending\":true,\"guestCount\":2,\"message\":\"Excited to join\"}"
curl -X POST "$BASE_URL/api/public/rsvp/$INVITATION_ID" -H "Content-Type: application/json" -d "{\"guestName\":\"Sara\",\"attending\":false,\"guestCount\":1}"
```

Orders:

```bash
curl -X POST "$BASE_URL/api/orders" -H "Content-Type: application/json" -d "{\"invitationId\":\"$INVITATION_ID\",\"customerEmail\":\"couple@example.com\",\"package\":\"STANDARD\",\"amount\":1999,\"currency\":\"INR\",\"paymentMethod\":\"upi\"}"
curl "$BASE_URL/api/orders" -H "Authorization: Bearer $TOKEN"
curl -X PATCH "$BASE_URL/api/orders/$ORDER_ID/verify-payment" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"transactionId\":\"UTR12345678\"}"
```

AI helpers:

```bash
curl -X POST "$BASE_URL/api/analyze-invitation" -F "image=@./card.jpg"
curl -X POST "$BASE_URL/api/generate-template" -H "Content-Type: application/json" -d "{\"card_type\":\"wedding\",\"visual_style\":{\"theme\":\"floral\",\"primary_colors\":[\"#F5EDE2\",\"#C89C6D\",\"#4A3931\"]}}"
curl -X POST "$BASE_URL/api/image-to-website" -F "image=@./reference.png" -F "instructions=Keep it minimal"
```
