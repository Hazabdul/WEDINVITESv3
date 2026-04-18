# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user credentials set
- [ ] IP whitelist configured (include Vercel IPs)
- [ ] Database backups enabled
- [ ] Connection string tested locally
- [ ] Collections created and indexes set
- [ ] Sample data seeded (optional)

### Backend
- [ ] All environment variables set in `.env`
- [ ] CORS configured for your domain
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Email service configured and tested
- [ ] Error handling tested
- [ ] Database connections working
- [ ] Local testing passed
- [ ] No console.log statements in production code
- [ ] Security headers configured (helmet)
- [ ] Rate limiting implemented (optional)

### Frontend
- [ ] Environment variables set in `.env.local`
- [ ] API base URL points to backend
- [ ] Built successfully (`npm run build`)
- [ ] No build warnings
- [ ] All routes working
- [ ] Images and assets loading
- [ ] Mobile responsive design verified
- [ ] Browser compatibility checked

### Deployment
- [ ] GitHub repositories created (frontend + backend)
- [ ] Vercel projects created
- [ ] Environment variables added to Vercel
- [ ] Deploy keys configured
- [ ] Domain registered and ready
- [ ] SSL/TLS certificates available

---

## 🌐 Domain Configuration

### Domain Registrar Setup
Update DNS records at your registrar (GoDaddy, Namecheap, etc.):

```
Type: A
Name: @
Value: 76.76.19.20 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel.com

Type: CNAME
Name: api
Value: cname.vercel.com
```

### Vercel Domain Configuration

#### Frontend (weddinginvites.online)
1. Go to Vercel Project Settings > Domains
2. Add `weddinginvites.online`
3. Add `www.weddinginvites.online`
4. Copy DNS records to your registrar
5. Wait for verification (usually 5-30 minutes)

#### Backend (api.weddinginvites.online)
1. Go to Vercel Backend Project Settings > Domains
2. Add `api.weddinginvites.online`
3. Copy DNS records to your registrar
4. Wait for verification

---

## 🔒 Security Checklist

### Environment Variables
- [ ] `JWT_SECRET`: Strong random string (32+ chars)
  ```bash
  # Generate with:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] `MONGODB_URI`: Connection string from MongoDB Atlas
- [ ] `EMAIL_PASSWORD`: Gmail app password (not main password)
- [ ] `FRONTEND_URL`: Production URL only
- [ ] `NODE_ENV`: Set to "production"

### CORS & Security
- [ ] CORS origin restricted to your domain
- [ ] Helmet middleware enabled
- [ ] HTTPS enforced everywhere
- [ ] Secure cookies configured (if using)
- [ ] No sensitive data in client-side code
- [ ] API keys not exposed in frontend

### Database Security
- [ ] MongoDB authentication enabled
- [ ] IP whitelist configured
- [ ] Automatic backups enabled
- [ ] Database encryption at rest (Atlas M10+)
- [ ] No default passwords used
- [ ] Regular password rotation planned

### Email Security
- [ ] Gmail 2FA enabled
- [ ] App password created (not account password)
- [ ] Email templates sanitized
- [ ] Rate limiting on email endpoints

---

## 📊 Monitoring & Logging

### Vercel Monitoring
1. Enable analytics in Vercel dashboard
2. Set up email alerts for failed deployments
3. Monitor function duration and memory usage
4. Check error logs regularly

### Application Monitoring (Optional)
Consider adding:
- [ ] Sentry for error tracking
- [ ] LogRocket for session replay
- [ ] Datadog for performance monitoring
- [ ] New Relic for APM

### Logging
- [ ] Backend logs accessible
- [ ] Frontend error tracking enabled
- [ ] User activity logging (if required)
- [ ] Database query logging disabled in production

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] User registration/login works
- [ ] Can create invitation with all fields
- [ ] Image upload works
- [ ] Preview renders correctly
- [ ] RSVP submission works
- [ ] Email notifications sent
- [ ] Payment processing works (if applicable)
- [ ] Can delete/edit invitations

### Performance Testing
- [ ] Frontend load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Images optimized and cached
- [ ] No memory leaks

### Security Testing
- [ ] SQL injection prevention
- [ ] XSS protection working
- [ ] CSRF tokens implemented
- [ ] Authentication required for protected routes
- [ ] Rate limiting working
- [ ] No sensitive data in responses

### Browser Compatibility
- [ ] Chrome/Edge ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Mobile browsers ✓

---

## 📱 Responsive Design Verification

Test on:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Touch interactions
- [ ] Landscape orientation

---

## 🚀 Deployment Steps

### Step 1: Frontend Deployment
```bash
# Push to GitHub
git add .
git commit -m "Production release v1.0"
git push origin main

# Vercel auto-deploys
# Verify at https://vercel.com/[your-account]/[project-name]
```

### Step 2: Backend Deployment
```bash
# Push to GitHub
git add .
git commit -m "Backend production release v1.0"
git push origin main

# Vercel auto-deploys API
# Verify at https://vercel.com/[your-account]/[backend-project-name]
```

### Step 3: Domain Verification
1. Check frontend at https://weddinginvites.online
2. Check backend at https://api.weddinginvites.online/health
3. Verify API calls work from frontend
4. Test complete user flow

### Step 4: Post-Deployment
- [ ] Monitor error logs for issues
- [ ] Check email notifications working
- [ ] Verify analytics tracking
- [ ] Test payment processing
- [ ] Create support documentation

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📞 Support & Monitoring

### Monitoring URLs
- Frontend: https://weddinginvites.online
- Backend API: https://api.weddinginvites.online/health
- Vercel Dashboard: https://vercel.com
- MongoDB Atlas: https://cloud.mongodb.com

### Error Reporting
Set up notifications for:
- [ ] Failed deployments
- [ ] API errors (500+)
- [ ] Database connection issues
- [ ] Email delivery failures

### Status Page (Optional)
Consider using StatusPage.io or similar to communicate uptime to users.

---

## 📅 Post-Launch Checklist

### Week 1
- [ ] Monitor error logs daily
- [ ] Test all features thoroughly
- [ ] Check email deliverability
- [ ] Monitor performance metrics
- [ ] Gather user feedback

### Month 1
- [ ] Review analytics data
- [ ] Optimize slow queries
- [ ] Implement user feedback
- [ ] Update documentation
- [ ] Plan scaling strategy

### Ongoing
- [ ] Monitor costs (MongoDB, Vercel)
- [ ] Update dependencies monthly
- [ ] Review security audit logs
- [ ] Backup important data
- [ ] Plan new features

---

## 🆘 Emergency Contacts

- **Hosting Support**: Vercel support dashboard
- **Database Support**: MongoDB Atlas support
- **Domain Issues**: Domain registrar support
- **Email Issues**: Gmail security settings

---

## ✨ Launch Success Indicators

You're ready to launch when:
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Monitoring in place
- [ ] Team trained on deployment process
- [ ] Rollback plan documented

---

**Last Updated**: April 18, 2026
**Status**: Ready for Production Deployment

