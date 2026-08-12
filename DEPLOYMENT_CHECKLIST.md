# Emergency Echo - Production Deployment Checklist

Complete all items before deploying to production. This ensures security, stability, and proper functionality.

---

## Pre-Deployment Phase (1-2 Days Before)

### Security Configuration
- [ ] All required environment variables obtained and validated
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] N8N_SIGNUP_WEBHOOK_URL
  - [ ] N8N_LOGIN_WEBHOOK_URL
  - [ ] N8N_EMAIL_WEBHOOK_URL
  - [ ] N8N_PASSWORD_RESET_WEBHOOK_URL
  - [ ] NEXT_PUBLIC_APP_URL
  - [ ] CORS_ALLOWED_ORIGINS
- [ ] No hardcoded secrets found in codebase
  - [ ] Run: `grep -r "eyJ\|sk_live\|AKIA" frontend/src --exclude-dir=node_modules`
  - [ ] No JWT tokens or API keys in source code
- [ ] `.env.local` and `.env.*.local` files are in `.gitignore`
- [ ] All sensitive files are `.gitignored`

### Code Quality & Testing
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No lint errors: `npm run lint`
- [ ] No security vulnerabilities: `npm audit`
  - [ ] All high/critical vulnerabilities addressed
- [ ] Code review completed by team member
- [ ] All tests passing: `npm run test`
- [ ] Application tested locally in production mode: `npm run build && npm run start`

### Database & Supabase
- [ ] Supabase project created and credentials obtained
- [ ] All required tables created:
  - [ ] `profiles`
  - [ ] `document_uploads`
  - [ ] `email_verifications`
  - [ ] Additional tables for your schema
- [ ] Row-Level Security (RLS) policies are configured
- [ ] Database backups are enabled
- [ ] Connection pooling configured (for high traffic)

### n8n Workflow Integration
- [ ] All 4 n8n workflows created and tested:
  - [ ] Signup workflow
  - [ ] Login workflow
  - [ ] Email verification workflow
  - [ ] Password reset workflow
- [ ] Webhook URLs are active and accessible
- [ ] Webhook payloads validated (correct format, all fields)
- [ ] Error handling in workflows (fallback responses)
- [ ] Logging enabled in workflows
- [ ] n8n authentication/security configured (if applicable)

### Domain & DNS
- [ ] Production domain registered and verified
- [ ] DNS records configured (A record pointing to deployment server)
- [ ] SSL certificate obtained (auto via Vercel/Netlify if applicable)
- [ ] Domain added to `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Domain added to `CORS_ALLOWED_ORIGINS`

### Staging Verification
- [ ] Application deployed to staging environment
- [ ] All features tested on staging (full user flow):
  - [ ] Signup process
  - [ ] Email verification
  - [ ] Login process
  - [ ] Password reset
  - [ ] Document upload
  - [ ] Admin dashboard
- [ ] Load testing completed (verify rate limiting works)
- [ ] Monitor staging for 24 hours to catch intermittent issues

---

## Deployment Day

### Final Checks (30 Minutes Before)
- [ ] All team members notified of deployment window
- [ ] Rollback plan documented and team is aware
- [ ] Monitoring dashboard is accessible
- [ ] Team members standing by for issues
- [ ] Latest code changes are merged to main/master branch
- [ ] All environment variables confirmed in deployment platform

### Deployment Execution
- [ ] Build succeeds without errors: `npm run build`
- [ ] Deploy to production
- [ ] Deployment completes successfully
- [ ] No errors in deployment logs

### Immediate Post-Deployment (First 5 Minutes)
- [ ] Application is accessible at production URL
- [ ] No 500 errors on homepage
- [ ] Environment variables are set correctly
  - [ ] Check: Application should NOT show "Missing environment variables"
- [ ] Database connection is working
  - [ ] Try login with test account → should work
- [ ] Rate limiting is working
  - [ ] Make rapid requests → should get 429 on 6th request
- [ ] CORS is configured correctly
  - [ ] No CORS errors in browser console
- [ ] Monitoring is active (logs are being captured)

### Functional Testing (First Hour)
- [ ] **Signup Flow**:
  - [ ] Register new account (all roles)
  - [ ] Verify email is sent via n8n
  - [ ] Email verification token works
  - [ ] Account is created in database
- [ ] **Login Flow**:
  - [ ] Login with valid credentials
  - [ ] Receives JWT tokens
  - [ ] Invalid credentials rejected (401)
  - [ ] Unverified account rejected with helpful message
- [ ] **Password Reset**:
  - [ ] Request password reset
  - [ ] Email is sent via n8n
  - [ ] Reset token works
  - [ ] New password is accepted
- [ ] **Document Upload** (doctor/nurse only):
  - [ ] Doctor can upload documents
  - [ ] File size limits enforced
  - [ ] Invalid file types rejected
  - [ ] Admin can verify documents
- [ ] **Admin Dashboard**:
  - [ ] Admin can access analytics
  - [ ] User counts are accurate
  - [ ] Verification status is correct
  - [ ] Document approval works

### Security Validation (First Hour)
- [ ] **Input Sanitization**:
  - [ ] Try SQL injection in email field → safely rejected
  - [ ] Try XSS in name field → HTML tags escaped
  - [ ] Try script injection → safely handled
- [ ] **Rate Limiting**:
  - [ ] Signup rate limit enforced (5/min per IP)
  - [ ] Login rate limit enforced (10/min per IP)
  - [ ] Rate limit headers present in responses
- [ ] **CORS Security**:
  - [ ] Requests from unauthorized origins rejected
  - [ ] Requests from allowed origins accepted
  - [ ] OPTIONS preflight requests work
- [ ] **Admin Authentication**:
  - [ ] Non-admin users cannot access admin endpoints
  - [ ] Missing/invalid tokens rejected (401/403)
  - [ ] Admin-only endpoints return 403 for non-admins

### Monitoring Setup (First Hour)
- [ ] Error monitoring is capturing errors
- [ ] Logs are being aggregated
- [ ] Performance metrics are being tracked
- [ ] Alert thresholds are configured:
  - [ ] High error rate alert
  - [ ] High latency alert
  - [ ] Uptime monitoring alert

---

## First 24 Hours (Ongoing Monitoring)

### Hourly Checks
- [ ] Application is responsive (no timeouts)
- [ ] No spike in error rates
- [ ] n8n webhooks are being called successfully
- [ ] Database is performing well (no slow queries)
- [ ] No CORS errors reported

### Log Review
- [ ] No repeated error patterns
- [ ] Auth failures are at expected levels
- [ ] Rate limiting is working as designed
- [ ] n8n webhook calls are successful
- [ ] No suspicious activity

### Performance Monitoring
- [ ] Page load times are acceptable
- [ ] API response times are <500ms
- [ ] Database query times are <200ms
- [ ] No memory leaks (memory usage stable)
- [ ] CPU usage is normal

---

## First Week (Production Stabilization)

### Daily Tasks
- [ ] Review error logs daily
- [ ] Monitor system performance
- [ ] Check rate limit statistics
- [ ] Verify email delivery (n8n logs)
- [ ] Monitor database usage

### Weekly Review
- [ ] Analyze user signup/login metrics
- [ ] Review failed authentication attempts
- [ ] Check disk usage trends
- [ ] Review API performance metrics
- [ ] Plan any necessary optimizations

### Feedback Collection
- [ ] Gather user feedback about signup/login
- [ ] Address any reported issues quickly
- [ ] Document any workarounds needed
- [ ] Plan follow-up improvements

---

## Ongoing Maintenance (Monthly)

### Security
- [ ] Review and rotate API keys quarterly
- [ ] Update dependencies for security patches
- [ ] Review Supabase audit logs
- [ ] Check for any failed authentication attempts
- [ ] Review CORS configuration for new domains

### Performance
- [ ] Monitor database performance
- [ ] Optimize slow queries if found
- [ ] Review rate limiting statistics
- [ ] Monitor API response times
- [ ] Plan scaling if needed

### Reliability
- [ ] Review error logs for patterns
- [ ] Test backup/restore procedure
- [ ] Review monitoring alerts configuration
- [ ] Plan disaster recovery drills
- [ ] Update runbooks with lessons learned

---

## Rollback Procedure (If Issues Found)

### Immediate Actions (If Critical Issue)
- [ ] Revert to previous production version
- [ ] Restore database from backup if necessary
- [ ] Notify all users of issue and status
- [ ] Enable maintenance mode if available

### Investigation
- [ ] Review deployment logs
- [ ] Check application logs for errors
- [ ] Review recent code changes
- [ ] Check environment variable configuration
- [ ] Verify n8n webhooks are accessible

### Prevention
- [ ] Add tests for the issue that was found
- [ ] Update documentation
- [ ] Brief team on what went wrong
- [ ] Plan fix for next deployment

---

## Quick Reference: Environment Variables

Before deploying, verify these are set:

```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ N8N_SIGNUP_WEBHOOK_URL
✓ N8N_LOGIN_WEBHOOK_URL
✓ N8N_EMAIL_WEBHOOK_URL
✓ N8N_PASSWORD_RESET_WEBHOOK_URL
✓ NEXT_PUBLIC_APP_URL
✓ CORS_ALLOWED_ORIGINS
```

---

## Support & Escalation

**For issues during deployment:**

1. **Check logs first** - Find the specific error message
2. **Review SECURITY_SETUP.md** - Many issues have solutions there
3. **Verify environment variables** - 80% of issues are env var related
4. **Check n8n webhooks** - Verify they're responding correctly
5. **Verify database connectivity** - Test with a simple query

**Critical issues:**
- If signup/login completely down → Check n8n webhooks
- If database errors → Check SUPABASE_SERVICE_ROLE_KEY
- If CORS errors → Check CORS_ALLOWED_ORIGINS setting
- If app won't start → Check for missing required environment variables

---

## Sign-Off

- [ ] All items completed
- [ ] Deployment verified successful
- [ ] Team is aware of production status
- [ ] Monitoring is active

**Deployed by**: _________________ **Date**: _________________

**Verified by**: _________________ **Date**: _________________
