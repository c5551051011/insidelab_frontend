import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Building2, GraduationCap } from 'lucide-react';
import { colors, spacing } from '../theme';
import emailVerificationService from '../services/emailVerificationService';

const EmailVerificationModal = ({ isOpen, onClose, user, onVerificationComplete }) => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Email sent confirmation
  const [formData, setFormData] = useState({
    universityEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  // Get university and department from user data
  const universityName = user?.university_name || user?.university || '';
  const department = user?.department_name || user?.department || '';

  const validateForm = () => {
    if (!formData.universityEmail.trim()) {
      setError('University email is required');
      return false;
    }

    if (!emailVerificationService.isValidEmailFormat(formData.universityEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!emailVerificationService.isUniversityEmail(formData.universityEmail)) {
      setError('Please enter a university email address (.edu, .ac.kr, etc.)');
      return false;
    }

    return true;
  };

  const handleSendVerification = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await emailVerificationService.sendVerificationEmail(
        formData.universityEmail.trim(),
        universityName,
        department
      );

      if (result.success) {
        setVerificationId(result.verificationId);
        setStep(2);
      }
    } catch (error) {
      setError(error.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await emailVerificationService.resendVerificationEmail(verificationId);
      // Show success feedback (could add a toast notification)
      setError('');
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      universityEmail: ''
    });
    setError('');
    setVerificationId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4]
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[6],
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: spacing[4],
            right: spacing[4],
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: spacing[2],
            borderRadius: '8px',
            color: colors.textSecondary,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={20} />
        </button>

        {/* Step 1: Enter University Email */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                margin: 0,
                marginBottom: spacing[3],
                fontFamily: 'Inter'
              }}>
                Verify Your University Email
              </h2>
              <p style={{
                fontSize: '16px',
                color: colors.textSecondary,
                margin: 0,
                lineHeight: 1.5,
                fontFamily: 'Inter'
              }}>
                Please provide your university email address to verify your academic affiliation.
              </p>
            </div>

            <div style={{ marginBottom: spacing[6] }}>
              {/* University and Department info display */}
              {(universityName || department) && (
                <div style={{
                  padding: spacing[4],
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  marginBottom: spacing[4],
                  border: `1px solid ${colors.border}`
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: 0,
                    marginBottom: spacing[2],
                    fontFamily: 'Inter'
                  }}>
                    Your Profile Information:
                  </h4>
                  {universityName && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      marginBottom: spacing[2]
                    }}>
                      <Building2 size={16} color={colors.textSecondary} />
                      <span style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        fontFamily: 'Inter'
                      }}>
                        <strong>University:</strong> {universityName}
                      </span>
                    </div>
                  )}
                  {department && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2]
                    }}>
                      <GraduationCap size={16} color={colors.textSecondary} />
                      <span style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        fontFamily: 'Inter'
                      }}>
                        <strong>Department:</strong> {department}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: spacing[4] }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  University Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={formData.universityEmail}
                    onChange={(e) => handleInputChange('universityEmail', e.target.value)}
                    placeholder="your.email@university.edu"
                    style={{
                      width: '100%',
                      padding: `${spacing[3]} ${spacing[4]}`,
                      paddingLeft: spacing[10],
                      border: `1px solid ${error ? colors.error : colors.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'Inter',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? colors.error : colors.border;
                    }}
                  />
                  <Mail
                    size={20}
                    color={colors.textSecondary}
                    style={{
                      position: 'absolute',
                      left: spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: spacing[3],
                  backgroundColor: `${colors.error}10`,
                  border: `1px solid ${colors.error}30`,
                  borderRadius: '8px',
                  marginBottom: spacing[4]
                }}>
                  <AlertCircle size={16} color={colors.error} />
                  <span style={{
                    fontSize: '14px',
                    color: colors.error,
                    fontFamily: 'Inter'
                  }}>
                    {error}
                  </span>
                </div>
              )}

              <div style={{
                padding: spacing[3],
                backgroundColor: colors.background,
                borderRadius: '8px',
                marginBottom: spacing[4]
              }}>
                <p style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.4,
                  fontFamily: 'Inter'
                }}>
                  <strong>Accepted domains:</strong> .edu, .ac.kr, .ac.uk, .edu.au, .ac.jp, .ac.cn, .com (for testing), and other university domains
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: spacing[3],
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleClose}
                style={{
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = colors.background;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendVerification}
                disabled={isLoading}
                style={{
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: isLoading ? colors.textTertiary : colors.primary,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter'
                }}
              >
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Email Sent Confirmation */}
        {step === 2 && (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: spacing[6]
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: `${colors.primary}10`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[4]
              }}>
                <CheckCircle size={40} color={colors.primary} />
              </div>

              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                margin: 0,
                marginBottom: spacing[3],
                fontFamily: 'Inter'
              }}>
                Verification Email Sent!
              </h2>

              <p style={{
                fontSize: '16px',
                color: colors.textSecondary,
                margin: 0,
                lineHeight: 1.5,
                fontFamily: 'Inter',
                marginBottom: spacing[4]
              }}>
                We've sent a verification email to <strong>{formData.universityEmail}</strong>.
                Please check your inbox and click the verification link to complete the process.
                {universityName && (
                  <>
                    <br /><br />
                    <strong>University:</strong> {universityName}
                    {department && <><br /><strong>Department:</strong> {department}</>}
                  </>
                )}
              </p>

              <div style={{
                padding: spacing[4],
                backgroundColor: colors.background,
                borderRadius: '8px',
                marginBottom: spacing[6]
              }}>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.4,
                  fontFamily: 'Inter'
                }}>
                  <strong>Didn't receive the email?</strong><br />
                  Check your spam folder or click the button below to resend.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: spacing[3],
              justifyContent: 'center'
            }}>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                style={{
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '8px',
                  color: colors.primary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = `${colors.primary}10`;
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {isLoading ? 'Sending...' : 'Resend Email'}
              </button>
              <button
                onClick={() => {
                  // Call verification complete callback with the data
                  if (onVerificationComplete) {
                    onVerificationComplete({
                      universityEmail: formData.universityEmail,
                      universityName: universityName,
                      department: department
                    });
                  }
                  handleClose();
                }}
                style={{
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: colors.primary,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter'
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;