export function registrationEmailTemplate({ username }: { username: string }) {
  return `
    <h2>Welcome to PawConnect, ${username}!</h2>
    <p>Thank you for registering. We’re excited to have you join our community.</p>
    <p>Get started by adding your pets and connecting with other pet lovers!</p>
    <p>Best regards,<br/>The PawConnect Team</p>
  `;
}

export function forgotPasswordEmailTemplate({ username, resetLink }: { username: string, resetLink: string }) {
  return `
    <h2>Password Reset Request</h2>
    <p>Hello ${username},</p>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>Best regards,<br/>The PawConnect Team</p>
  `;
} 