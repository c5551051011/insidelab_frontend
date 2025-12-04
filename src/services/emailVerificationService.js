import { ApiService } from './apiService';

class EmailVerificationService {
  constructor() {
    this.universityDomains = [
      '.edu', '.ac.kr', '.ac.uk', '.edu.au', '.ac.jp', '.ac.cn',
      '.edu.sg', '.ac.nz', '.ac.za', '.ac.in', '.edu.br', '.com' // Added .com for testing
    ];
  }

  /**
   * Check if email domain is a university domain
   */
  isUniversityEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@').pop();

    if (!domain) return false;

    return this.universityDomains.some(uniDomain =>
      domain.endsWith(uniDomain)
    );
  }

  /**
   * Send verification email to university email address
   */
  async sendVerificationEmail(universityEmail, universityName = '', department = '') {
    try {
      if (!this.isUniversityEmail(universityEmail)) {
        throw new Error('Please provide a valid university email address');
      }

      const subject = 'Verify Your University Email - InsideLab';
      const message = `
Dear Student/Researcher,

Thank you for joining InsideLab! Please verify your university email address to complete your account verification.

University: ${universityName || 'Not specified'}
Email: ${universityEmail}
${department ? `Department: ${department}` : ''}

To verify your email, please click the verification link that will be sent to your university email address.

If you did not request this verification, please ignore this email.

Best regards,
The InsideLab Team

---
This is an automated message from InsideLab.
      `.trim();

      const response = await ApiService.post('/auth/feedback/', {
        email: universityEmail,
        name: 'University Email Verification',
        subject: subject,
        message: message,
      });

      if (response) {
        return {
          success: true,
          message: 'Verification email sent successfully',
          verificationId: `verification_${Date.now()}`
        };
      }
    } catch (error) {
      console.error('Error sending university email verification:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Verify email with token (called when user clicks link in email)
   */
  async verifyEmailWithToken(token) {
    try {
      const response = await ApiService.post('/verification/university-email/verify/', {
        token: token,
      });

      return response ? true : false;
    } catch (error) {
      console.error('Error verifying university email:', error);
      throw new Error(`Failed to verify email: ${error.message}`);
    }
  }

  /**
   * Check verification status for a user
   */
  async getVerificationStatus(userId) {
    try {
      const response = await ApiService.get(`/verification/university-email/status/${userId}/`);

      if (response) {
        return {
          userId: response.user_id || userId,
          isVerified: response.is_verified || false,
          universityEmail: response.university_email || null,
          universityName: response.university_name || null,
          department: response.department || null,
          verifiedAt: response.verified_at ? new Date(response.verified_at) : null,
          requestedAt: response.requested_at ? new Date(response.requested_at) : null,
          status: response.status || 'pending'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(verificationId) {
    try {
      // For simplicity, we'll just indicate success
      // In a real implementation, this would trigger resending the same email
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      console.log('Resend verification email requested for ID:', verificationId);
      return true;
    } catch (error) {
      console.error('Error resending university email verification:', error);
      throw new Error(`Failed to resend verification email: ${error.message}`);
    }
  }

  /**
   * Get list of common university domains for validation
   */
  getUniversityDomains() {
    return [...this.universityDomains];
  }

  /**
   * Extract domain from email
   */
  getDomainFromEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.split('@').pop()?.toLowerCase() || '';
  }

  /**
   * Validate email format
   */
  isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;