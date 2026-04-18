# 🔌 API Quick Reference

## Base URLs

**Development**
```
http://localhost:5000/api
```

**Production**
```
https://api.weddinginvites.online/api
```

---

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "123...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "123...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN"
}
```

---

## Invitations (Protected Routes)

### Create Invitation
```http
POST /api/invitations
Authorization: Bearer {token}
Content-Type: application/json

{
  "coupleNames": "John & Jane Doe",
  "eventDate": "2024-06-15",
  "location": "New York, NY",
  "template": "classic",
  "theme": {
    "primaryColor": "#ff1493",
    "fontStyle": "elegant"
  },
  "content": {
    "familyContent": "Join us...",
    "specialInstructions": "RSVP by June 1st"
  }
}

Response: 201 Created
{
  "_id": "invitation123",
  "coupleNames": "John & Jane Doe",
  "slug": "john-jane-doe-2024",
  "isPublished": false,
  "createdAt": "2024-04-18T10:00:00Z"
}
```

### Get All Invitations
```http
GET /api/invitations
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "invitation123",
    "coupleNames": "John & Jane Doe",
    "eventDate": "2024-06-15",
    "slug": "john-jane-doe-2024",
    "isPublished": true
  }
]
```

### Get Specific Invitation
```http
GET /api/invitations/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "invitation123",
  "coupleNames": "John & Jane Doe",
  "eventDate": "2024-06-15",
  "location": "New York, NY",
  "template": "classic",
  "theme": {...},
  "content": {...},
  "media": [...]
}
```

### Update Invitation
```http
PUT /api/invitations/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "coupleNames": "John & Jane Smith",
  "eventDate": "2024-06-20"
}

Response: 200 OK
{
  "_id": "invitation123",
  "coupleNames": "John & Jane Smith",
  "eventDate": "2024-06-20",
  "updatedAt": "2024-04-18T11:00:00Z"
}
```

### Delete Invitation
```http
DELETE /api/invitations/{id}
Authorization: Bearer {token}

Response: 204 No Content
```

---

## File Upload (Protected Route)

### Upload File
```http
POST /api/uploads
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <image file>

Response: 200 OK
{
  "success": true,
  "filename": "1234567890-image.jpg",
  "url": "/uploads/1234567890-image.jpg",
  "size": 245000
}
```

---

## Public Endpoints (No Auth Required)

### Get Public Invitation
```http
GET /api/public/invitations/{slug}

Response: 200 OK
{
  "_id": "invitation123",
  "coupleNames": "John & Jane Doe",
  "eventDate": "2024-06-15",
  "location": "New York, NY",
  "template": "classic",
  "theme": {...},
  "content": {...},
  "media": [...]
}
```

### Submit RSVP
```http
POST /api/public/rsvp/{invitationId}
Content-Type: application/json

{
  "guestName": "Alice Smith",
  "guestEmail": "alice@example.com",
  "attending": true,
  "dietaryRestrictions": "Vegetarian",
  "plusOnes": 1
}

Response: 201 Created
{
  "_id": "rsvp123",
  "guestName": "Alice Smith",
  "attending": true,
  "createdAt": "2024-04-18T12:00:00Z"
}
```

---

## Orders (Protected Route)

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "invitationId": "invitation123",
  "amount": 50.00,
  "currency": "USD",
  "paymentMethod": "stripe"
}

Response: 201 Created
{
  "_id": "order123",
  "invitationId": "invitation123",
  "amount": 50.00,
  "status": "pending",
  "createdAt": "2024-04-18T13:00:00Z"
}
```

### Get All Orders
```http
GET /api/orders
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "order123",
    "invitationId": "invitation123",
    "amount": 50.00,
    "status": "completed"
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - You don't have permission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Invitation not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - New resource created |
| 204 | No Content - Deletion successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Using with Frontend API Client

### Fetch-based Client (api.js)
```javascript
import { apiClient } from './utils/api';

// Login
const user = await apiClient.login('email@example.com', 'password');

// Create invitation
const inv = await apiClient.createInvitation({
  coupleNames: 'John & Jane',
  eventDate: '2024-06-15',
  location: 'New York'
});

// Upload file
const result = await apiClient.uploadFile(file);

// Get public invitation
const publicInv = await apiClient.getPublicInvitation('john-jane-2024');

// Submit RSVP
await apiClient.submitRSVP(invitationId, {
  name: 'Alice',
  email: 'alice@example.com',
  attending: true
});
```

### Axios-based Client (axiosClient.js)
```javascript
import APIClient from './utils/axiosClient';

// Login
const user = await APIClient.login('email@example.com', 'password');

// Create invitation
const inv = await APIClient.createInvitation({
  coupleNames: 'John & Jane',
  eventDate: '2024-06-15',
  location: 'New York'
});

// All methods same as fetch-based client
```

---

## Headers

### Required Headers
```
Content-Type: application/json
```

### Optional Headers
```
Authorization: Bearer {jwt_token}
Accept: application/json
Accept-Language: en-US
```

### File Upload Headers (Automatic)
```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

---

## Rate Limiting (Recommended)

Recommended rate limits to implement:

```
Public Endpoints:
  100 requests/hour per IP

Protected Endpoints:
  1000 requests/hour per user

Login Endpoint:
  5 attempts/minute per IP

Upload Endpoint:
  10 uploads/minute per user
  Max file size: 5MB

RSVP Endpoint:
  100 submissions/minute per invitation
```

---

## Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get invitations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/invitations

# Health check
curl http://localhost:5000/health
```

### Using Postman
1. Import API collection
2. Set base URL: `http://localhost:5000`
3. Login and copy token
4. Add to "Authorization" header
5. Test endpoints

### Using Insomnia
1. Create new project
2. Set base URL
3. Create requests for each endpoint
4. Test authentication flow
5. Export collection

---

## Common Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

## Troubleshooting

### CORS Error
```
Problem: "Access to XMLHttpRequest blocked by CORS"
Solution: Check FRONTEND_URL in backend .env
```

### 401 Unauthorized
```
Problem: "Invalid or missing token"
Solution: Login again or check token expiration
```

### 404 Not Found
```
Problem: "Resource not found"
Solution: Check invitation ID is correct
```

### 400 Bad Request
```
Problem: "Validation failed"
Solution: Check request format and required fields
```

---

## Best Practices

1. **Always include Authorization header** for protected routes
2. **Handle error responses** properly in frontend
3. **Validate input** before sending to API
4. **Store token securely** (localStorage or httpOnly cookies)
5. **Check token expiration** before making requests
6. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
7. **Include Content-Type header** for JSON requests
8. **Handle timeouts** gracefully (10s recommended)
9. **Implement retry logic** for failed requests
10. **Log errors** for debugging

---

**API Documentation Version**: 1.0
**Last Updated**: April 18, 2026
**Base URL**: https://api.weddinginvites.online

