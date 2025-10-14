import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Header from '../components/Header';
import { FormInput } from '../components/FormInput';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { ApiException } from '../services/apiService';

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isMobile = window.innerWidth < 768;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Sign in with:', formData);

      const response = await AuthService.login(formData.email.trim(), formData.password);

      console.log('Sign in successful:', response);

      // Navigate to home page on success
      navigate('/');

    } catch (error) {
      console.error('Sign in error:', error);

      let errorMessage = 'Sign in failed. Please check your credentials.';

      if (error instanceof ApiException) {
        if (error.statusCode === 0) {
          errorMessage = 'Cannot connect to server. Please try again later.';
        } else if (error.statusCode === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.statusCode === 404) {
          errorMessage = 'Account not found. Please sign up first.';
        } else {
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (parseError) {
            // Use default message if parsing fails
          }
        }
      } else if (error.message?.includes('No access token')) {
        errorMessage = 'Login response missing authentication token. Please contact support.';
      }

      // Show error message (you can implement a toast/snackbar here)
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      console.log('Google sign in - starting...');

      // For now, show message that Google Sign-In needs frontend Google integration
      alert('Google Sign-In functionality requires Google OAuth setup. Please use email/password sign-in for now.');

      // TODO: Implement Google OAuth2 integration
      // This would require setting up Google OAuth client and getting ID token
      // const googleResult = await signInWithGoogle();
      // const response = await AuthService.signInWithGoogle(
      //   googleResult.idToken,
      //   googleResult.email,
      //   googleResult.displayName
      // );
      // navigate('/');

    } catch (error) {
      console.error('Google sign in error:', error);
      alert('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)',
          padding: spacing[6],
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: isMobile ? spacing[6] : spacing[8],
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
            <h1
              style={{
                fontSize: isMobile ? '36px' : '48px',
                fontWeight: '700',
                color: colors.primary,
                marginBottom: spacing[2],
                fontFamily: 'Inter',
              }}
            >
              Insidelab
            </h1>
            <p
              style={{
                fontSize: isMobile ? '16px' : '18px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: 'Inter',
              }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn}>
            <FormInput
              label="Email"
              type="text"
              placeholder="your.email@university.edu"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              icon={Mail}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              icon={Lock}
              required
            />

            {/* Forgot Password */}
            <div
              style={{
                textAlign: 'right',
                marginBottom: spacing[6],
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.primary,
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontFamily: 'Inter',
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: loading ? colors.textTertiary : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing[4],
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = colors.primaryHover;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: spacing[4],
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: colors.border,
              }}
            />
            <span
              style={{
                padding: `0 ${spacing[4]}`,
                fontSize: isMobile ? '14px' : '16px',
                color: colors.textSecondary,
                fontWeight: '500',
                fontFamily: 'Inter',
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: colors.border,
              }}
            />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'white',
              color: colors.textPrimary,
              border: `1px solid ${colors.textTertiary}`,
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'Inter',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              marginBottom: spacing[6],
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.backgroundLight;
                e.target.style.borderColor = colors.textSecondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = colors.textTertiary;
              }
            }}
          >
            {loading ? (
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${colors.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <>
                <img
                  src="/assets/icons/google_logo.png"
                  alt="Google"
                  style={{ width: '20px', height: '20px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                Continue with Google
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: colors.textSecondary,
                fontFamily: 'Inter',
              }}
            >
              Don't have an account?{' '}
            </span>
            <Link
              to="/signup"
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: '600',
                fontFamily: 'Inter',
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;