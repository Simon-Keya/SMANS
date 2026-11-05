# Security testing checklist (SMANS)

Run before each production release.

## Authn / Authz
- [ ] Login with valid/invalid credentials
- [ ] 2FA enrollment, verify, disable; login with wrong/right TOTP
- [ ] Deactivated user cannot access dashboard
- [ ] Parent cannot open another parent's child invoice/student
- [ ] Teacher cannot grade students outside assigned class
- [ ] Student cannot call grades:enter actions
- [ ] Unauthenticated POST to /api/upload returns 401

## Rate limiting
- [ ] ENABLE_RATELIMIT=true without Redis rejects limited endpoints
- [ ] Login check-2fa rate limits after bursts

## Uploads
- [ ] Reject .exe / oversized files
- [ ] Filename path traversal does not escape uploads dir

## Payments
- [ ] M-Pesa callback with unknown CheckoutRequestID is no-op
- [ ] Duplicate callback does not double-apply
- [ ] STK initiate creates PENDING payment with checkoutRequestId

## Audit
- [ ] Sensitive mutations create audit rows with contentHash
- [ ] AuditService.verifyChain reports ok on clean data

## Headers / config
- [ ] No Access-Control-Allow-Origin: * on authenticated APIs
- [ ] Image remotePatterns not wildcard in production config

## Data protection
- [ ] Access logs retained per school policy
- [ ] Backup restore tested
