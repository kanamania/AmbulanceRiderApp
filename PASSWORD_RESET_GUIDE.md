# Password Reset Feature Guide

Complete guide for the forgot password and reset password functionality in the Ambulance Rider App.

## Overview

The password reset feature allows users to securely reset their password via email when they forget it. The process involves:

1. User requests password reset
2. System sends reset link via email
3. User clicks link and enters new password
4. Password is updated in the system

## User Flow

### Step 1: Request Password Reset

1. User navigates to login page
2. Clicks "Forgot Password?" link
3. Enters their email address
4. Clicks "Send Reset Link"
5. Receives confirmation message

### Step 2: Receive Email

User receives an email containing:
- Reset link with unique token
- Expiration time (typically 1 hour)
- Instructions

Example email format:
```
Subject: Reset Your Password - Ambulance Rider

Hi [User Name],

We received a request to reset your password. Click the link below to create a new password:

[Reset Password Button/Link]
https://yourapp.com/reset-password?token=abc123xyz...

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Thanks,
Ambulance Rider Team
```

### Step 3: Reset Password

1. User clicks link in email
2. Redirected to reset password page
3. Enters new password
4. Confirms new password
5. Clicks "Reset Password"
6. Sees success message
7. Redirected to login page

## Technical Implementation

### Frontend Components

#### 1. Forgot Password Page (`ForgotPassword.tsx`)

**Features**:
- Email input field
- Email validation
- Loading state
- Success/error messages
- Link back to login

**User Experience**:
- Clean, simple interface
- Clear instructions
- Immediate feedback
- Success confirmation

#### 2. Reset Password Page (`ResetPassword.tsx`)

**Features**:
- Token extraction from URL
- New password input
- Password confirmation
- Password strength validation
- Loading state
- Success/error messages

**User Experience**:
- Password requirements shown
- Real-time validation
- Success animation
- Auto-redirect to login

### Backend Requirements

#### 1. Forgot Password Endpoint

**Endpoint**: `POST /api/auth/forgot-password`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset instructions sent to your email"
}
```

**Backend Tasks**:
1. Validate email exists in database
2. Generate unique reset token
3. Store token with expiration (1 hour)
4. Send email with reset link
5. Return success response

**Security Considerations**:
- Always return success even if email doesn't exist (prevent email enumeration)
- Generate cryptographically secure token
- Set reasonable expiration time
- Rate limit requests (prevent abuse)

#### 2. Reset Password Endpoint

**Endpoint**: `POST /api/auth/reset-password`

**Request**:
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Backend Tasks**:
1. Validate token exists and not expired
2. Validate password strength
3. Hash new password
4. Update user password
5. Invalidate reset token
6. (Optional) Send confirmation email
7. Return success response

**Security Considerations**:
- Validate token hasn't been used
- Check token expiration
- Enforce password requirements
- Hash password with bcrypt/argon2
- Invalidate all user sessions
- Log password change event

### Database Schema

#### Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

## Security Best Practices

### Token Generation

```javascript
// Example: Generate secure token
const crypto = require('crypto');

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}
```

### Token Storage

- Store hashed version of token in database
- Set expiration time (recommended: 1 hour)
- Mark as used after successful reset
- Clean up expired tokens regularly

### Email Security

- Use HTTPS for reset links
- Include token in URL parameter
- Don't include sensitive info in email
- Use email templates
- Send from verified domain

### Rate Limiting

```javascript
// Example rate limits
- 3 requests per email per hour
- 10 requests per IP per hour
- Block after 5 failed reset attempts
```

### Password Validation

```javascript
// Minimum requirements
- At least 6 characters (configurable)
- Cannot be same as old password
- Cannot be common passwords
- (Optional) Require mix of characters
```

## Frontend Code Examples

### Using the Forgot Password Feature

```typescript
import authService from './services/auth.service';

// Request password reset
try {
  await authService.forgotPassword('user@example.com');
  console.log('Reset email sent');
} catch (error) {
  console.error('Failed to send reset email:', error);
}
```

### Using the Reset Password Feature

```typescript
import authService from './services/auth.service';

// Reset password with token
try {
  await authService.resetPassword('token123', 'newPassword');
  console.log('Password reset successful');
} catch (error) {
  console.error('Failed to reset password:', error);
}
```

## Testing

### Manual Testing

#### Test Forgot Password

1. Navigate to `/forgot-password`
2. Enter valid email
3. Click "Send Reset Link"
4. Check email inbox
5. Verify email received
6. Check success message

#### Test Reset Password

1. Click reset link in email
2. Verify redirect to `/reset-password?token=...`
3. Enter new password
4. Confirm password
5. Click "Reset Password"
6. Verify success message
7. Verify redirect to login
8. Test login with new password

### Edge Cases to Test

1. **Invalid Email**:
   - Non-existent email
   - Invalid format
   - Empty field

2. **Expired Token**:
   - Use token after expiration
   - Verify error message

3. **Used Token**:
   - Try to use token twice
   - Verify rejection

4. **Invalid Token**:
   - Malformed token
   - Non-existent token

5. **Password Validation**:
   - Too short password
   - Passwords don't match
   - Empty fields

### Automated Testing

```typescript
// Example test cases
describe('Password Reset', () => {
  it('should send reset email for valid email', async () => {
    // Test implementation
  });

  it('should reject invalid email', async () => {
    // Test implementation
  });

  it('should reset password with valid token', async () => {
    // Test implementation
  });

  it('should reject expired token', async () => {
    // Test implementation
  });
});
```

## Error Handling

### Common Errors

1. **Email not found**:
   - Message: "If an account exists, reset instructions will be sent"
   - (Don't reveal if email exists)

2. **Invalid token**:
   - Message: "Invalid or expired reset token"
   - Redirect to forgot password page

3. **Expired token**:
   - Message: "Reset link has expired. Please request a new one"
   - Provide link to request new reset

4. **Network error**:
   - Message: "Failed to send reset email. Please try again"
   - Retry button

5. **Validation error**:
   - Message: "Password must be at least 6 characters"
   - Highlight field

## Email Templates

### HTML Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      background: #3880ff; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <p>Hi {{name}},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p>
      <a href="{{reset_link}}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p>{{reset_link}}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Thanks,<br>Ambulance Rider Team</p>
  </div>
</body>
</html>
```

### Plain Text Email Template

```
Reset Your Password

Hi {{name}},

We received a request to reset your password. Click the link below to create a new password:

{{reset_link}}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Thanks,
Ambulance Rider Team
```

## Troubleshooting

### Email Not Received

**Possible Causes**:
- Email in spam folder
- Invalid email address
- Email service issues
- Rate limiting

**Solutions**:
- Check spam/junk folder
- Verify email address
- Wait and try again
- Contact support

### Reset Link Not Working

**Possible Causes**:
- Link expired
- Link already used
- Invalid token
- URL malformed

**Solutions**:
- Request new reset link
- Check link is complete
- Try copying full URL
- Contact support

### Password Not Updating

**Possible Causes**:
- Validation errors
- Network issues
- Server errors
- Token issues

**Solutions**:
- Check password requirements
- Verify internet connection
- Try again later
- Request new reset link

## Best Practices

### For Users

1. Use strong, unique passwords
2. Don't share reset links
3. Complete reset promptly
4. Update password manager
5. Enable 2FA if available

### For Developers

1. Use secure token generation
2. Set reasonable expiration
3. Rate limit requests
4. Log all attempts
5. Send confirmation emails
6. Invalidate old sessions
7. Clean up expired tokens
8. Monitor for abuse

### For System Administrators

1. Monitor reset requests
2. Set up email alerts
3. Review logs regularly
4. Configure rate limits
5. Test email delivery
6. Backup user data
7. Document procedures

## Monitoring & Analytics

### Metrics to Track

- Reset requests per day
- Success rate
- Average time to reset
- Failed attempts
- Expired tokens
- Email delivery rate

### Alerts to Set Up

- Unusual spike in requests
- High failure rate
- Email delivery issues
- Potential abuse detected

## Compliance

### GDPR Considerations

- Log password reset events
- Allow users to request data
- Secure token storage
- Data retention policies

### Security Compliance

- PCI DSS (if applicable)
- HIPAA (for health data)
- SOC 2 requirements
- Industry standards

## Future Enhancements

- [ ] SMS-based password reset
- [ ] Security questions
- [ ] Multi-factor authentication
- [ ] Password history
- [ ] Breach detection
- [ ] Account recovery options
- [ ] Biometric reset (mobile)

## Support

For issues with password reset:
1. Check this guide
2. Review error messages
3. Check email spam folder
4. Try requesting new link
5. Contact support if needed

---

**Remember**: Password reset is a critical security feature. Always prioritize security over convenience!
