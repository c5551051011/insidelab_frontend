import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, RefreshCw, Check, X, Loader } from 'lucide-react';
import Header from '../components/Header';
import { FormInput } from '../components/FormInput';
import UniversityDepartmentSelector from '../components/UniversityDepartmentSelector';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { ApiService, ApiException } from '../services/apiService';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    position: '',
    password: '',
    confirmPassword: '',
  });

  // University and Department selection
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedUniversityName, setSelectedUniversityName] = useState('');
  const [selectedUniversityDepartmentId, setSelectedUniversityDepartmentId] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [allowEmails, setAllowEmails] = useState(false);

  // Validation state
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    available: null,
    message: ''
  });
  const [usernameValidation, setUsernameValidation] = useState({
    checking: false,
    available: null,
    message: ''
  });

  // Debounce timers
  const emailTimeoutRef = useRef(null);
  const usernameTimeoutRef = useRef(null);

  // Position options
  const positions = [
    'PhD Student',
    'MS Student',
    'Undergrad',
    'PostDoc',
    'Research Assistant',
    'Faculty',
  ];

  // Generate random username on mount
  useEffect(() => {
    generateRandomUsername();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  const generateRandomUsername = () => {
    const adjectives = [
      'Smart', 'Bright', 'Quick', 'Swift', 'Sharp', 'Wise', 'Bold', 'Cool',
      'Calm', 'Kind', 'Fair', 'True', 'Clear', 'Keen', 'Rare', 'Pure'
    ];
    const nouns = [
      'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Phoenix', 'Dragon', 'Falcon', 'Wolf',
      'Bear', 'Hawk', 'Lion', 'Owl', 'Fox', 'Raven', 'Lynx', 'Shark'
    ];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);

    setFormData(prev => ({
      ...prev,
      username: `${randomAdjective}${randomNoun}${randomNumber}`
    }));
  };

  // Handlers for UniversityDepartmentSelector
  const handleUniversitySelected = (universityId, universityName) => {
    setSelectedUniversityId(universityId);
    setSelectedUniversityName(universityName);
    setSelectedUniversityDepartmentId('');
    if (errors.university) {
      setErrors(prev => ({ ...prev, university: '', department: '' }));
    }
  };

  const handleDepartmentSelected = (departmentId) => {
    setSelectedUniversityDepartmentId(departmentId);
    if (errors.department) {
      setErrors(prev => ({ ...prev, department: '' }));
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Debounced validation for email
    if (field === 'email') {
      // Reset validation state while typing
      setEmailValidation({ checking: false, available: null, message: '' });

      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      emailTimeoutRef.current = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }

    // Debounced validation for username
    if (field === 'username') {
      // Reset validation state while typing
      setUsernameValidation({ checking: false, available: null, message: '' });

      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email availability with debounce
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailValidation({ checking: false, available: null, message: '' });
      return;
    }

    setEmailValidation({ checking: true, available: null, message: '' });

    try {
      const response = await ApiService.checkEmailAvailability(email);
      console.log('Email validation response:', response);
      setEmailValidation({
        checking: false,
        available: response.available === true,
        message: response.message || ''
      });
    } catch (error) {
      console.error('Email validation error:', error);

      // 400 error means invalid format (too short, wrong format, etc.)
      if (error instanceof ApiException && error.statusCode === 400) {
        let errorMessage = 'Invalid email format';

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.email && Array.isArray(errorData.email)) {
            errorMessage = errorData.email[0];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // Keep default message
        }

        setEmailValidation({
          checking: false,
          available: false,
          message: errorMessage
        });
      } else {
        // Other errors (network, server, etc.)
        setEmailValidation({
          checking: false,
          available: null,
          message: 'Unable to verify email. Please try again.'
        });
      }
    }
  }, []);

  // Check username availability with debounce
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameValidation({ checking: false, available: null, message: '' });
      return;
    }

    setUsernameValidation({ checking: true, available: null, message: '' });

    try {
      const response = await ApiService.checkUsernameAvailability(username);
      console.log('Username validation response:', response);
      setUsernameValidation({
        checking: false,
        available: response.available === true,
        message: response.message || ''
      });
    } catch (error) {
      console.error('Username validation error:', error);

      // 400 error means invalid format (too short, invalid characters, etc.)
      if (error instanceof ApiException && error.statusCode === 400) {
        let errorMessage = 'Invalid username format';

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.username && Array.isArray(errorData.username)) {
            errorMessage = errorData.username[0];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // Keep default message
        }

        setUsernameValidation({
          checking: false,
          available: false,
          message: errorMessage
        });
      } else {
        // Other errors (network, server, etc.)
        setUsernameValidation({
          checking: false,
          available: null,
          message: 'Unable to verify username. Please try again.'
        });
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (emailValidation.available === false) {
      newErrors.email = emailValidation.message || 'This email is already taken';
    }

    if (!formData.username) {
      newErrors.username = 'Please choose a username';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (usernameValidation.available === false) {
      newErrors.username = usernameValidation.message || 'This username is already taken';
    }

    if (!formData.name) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.position) {
      newErrors.position = 'Please select your position';
    }

    if (!selectedUniversityId) {
      newErrors.university = 'Please select your university';
    }

    if (!selectedUniversityDepartmentId) {
      newErrors.department = 'Please select your department';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        name: formData.name.trim(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        position: formData.position,
        university_department: selectedUniversityId,
        department: selectedUniversityDepartmentId,
        language: 'en',
      });

      console.log('Sign up successful:', response);

      if (response.email_sent) {
        alert(`Account created successfully! ${response.message || 'Please check your email for verification.'}`);
      } else {
        alert('Account created successfully!');
      }

      navigate('/sign-in');

    } catch (error) {
      console.error('Sign up error:', error);

      let errorMessage = 'Sign up failed. Please try again.';

      if (error instanceof ApiException) {
        if (error.statusCode === 0) {
          errorMessage = 'Cannot connect to server. Please try again later.';
        } else if (error.statusCode === 409) {
          errorMessage = 'This email or username is already registered.';
        } else if (error.statusCode === 400) {
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.email) {
              errorMessage = `Email: ${errorData.email[0]}`;
            } else if (errorData.username) {
              errorMessage = `Username: ${errorData.username[0]}`;
            } else if (errorData.password) {
              errorMessage = `Password: ${errorData.password[0]}`;
            } else if (errorData.error || errorData.detail) {
              errorMessage = errorData.error || errorData.detail;
            }
          } catch (parseError) {
            // Use default message if parsing fails
          }
        }
      }

      alert(errorMessage);
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
            maxWidth: '500px',
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
            <h2
              style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter',
              }}
            >
              Join the community
            </h2>
            <p
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: 'Inter',
              }}
            >
              Share your lab experiences anonymously
            </p>
          </div>

          {/* Verification Notice */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.info + '1A',
              border: `1px solid ${colors.info}4D`,
              borderRadius: '12px',
              marginBottom: spacing[6],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: colors.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              >
                <Check size={12} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: '600',
                    color: colors.info,
                    fontSize: '16px',
                    marginBottom: '4px',
                    fontFamily: 'Inter',
                  }}
                >
                  Verification Notice
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    fontFamily: 'Inter',
                  }}
                >
                  Use any valid email address to create your account
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp}>
            {/* Email */}
            <div style={{ marginBottom: spacing[4] }}>
              <label
                style={{
                  display: 'block',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter',
                }}
              >
                Email Address <span style={{ color: colors.error }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color={colors.textTertiary}
                    style={{
                      position: 'absolute',
                      left: spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: `0 ${spacing[10]} 0 ${spacing[10]}`,
                      fontSize: '14px',
                      border: `2px solid ${
                        errors.email
                          ? colors.error
                          : emailValidation.available === true
                          ? colors.success
                          : emailValidation.available === false
                          ? colors.error
                          : colors.border
                      }`,
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      fontFamily: 'Inter',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    {emailValidation.checking ? (
                      <Loader size={18} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : emailValidation.available === true ? (
                      <Check size={18} color={colors.success} />
                    ) : emailValidation.available === false ? (
                      <X size={18} color={colors.error} />
                    ) : null}
                  </div>
                </div>
              </div>
              {errors.email && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.email}
                </p>
              )}
              {!errors.email && emailValidation.message && emailValidation.available !== null && (
                <p
                  style={{
                    fontSize: '12px',
                    color: emailValidation.available ? colors.success : colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {emailValidation.message}
                </p>
              )}
            </div>

            {/* Username with refresh button */}
            <div style={{ marginBottom: spacing[4] }}>
              <label
                style={{
                  display: 'block',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter',
                }}
              >
                Username <span style={{ color: colors.error }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Choose a unique username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: `0 ${spacing[10]} 0 ${spacing[3]}`,
                      fontSize: '14px',
                      border: `2px solid ${
                        errors.username
                          ? colors.error
                          : usernameValidation.available === true
                          ? colors.success
                          : usernameValidation.available === false
                          ? colors.error
                          : colors.border
                      }`,
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      fontFamily: 'Inter',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    {usernameValidation.checking ? (
                      <Loader size={18} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : usernameValidation.available === true ? (
                      <Check size={18} color={colors.success} />
                    ) : usernameValidation.available === false ? (
                      <X size={18} color={colors.error} />
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={generateRandomUsername}
                  style={{
                    height: '48px',
                    width: '48px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Generate random username"
                >
                  <RefreshCw size={20} color={colors.primary} />
                </button>
              </div>
              {errors.username && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.username}
                </p>
              )}
              {!errors.username && usernameValidation.message && usernameValidation.available !== null && (
                <p
                  style={{
                    fontSize: '12px',
                    color: usernameValidation.available ? colors.success : colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {usernameValidation.message}
                </p>
              )}
              {/* Privacy recommendation */}
              <div
                style={{
                  marginTop: spacing[2],
                  padding: spacing[2],
                  backgroundColor: colors.warning + '1A',
                  border: `1px solid ${colors.warning}33`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: 'Inter',
                }}
              >
                💡 For privacy, we recommend using the generated username instead of your real name
              </div>
            </div>

            {/* Full Name */}
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              icon={User}
              required
            />

            {/* Current Position */}
            <div style={{ marginBottom: spacing[4] }}>
              <label
                style={{
                  display: 'block',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter',
                }}
              >
                Current Position <span style={{ color: colors.error }}>*</span>
              </label>
              <select
                value={formData.position}
                onChange={handleInputChange('position')}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: `0 ${spacing[3]}`,
                  fontSize: '14px',
                  border: `2px solid ${errors.position ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  fontFamily: 'Inter',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select your position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.position}
                </p>
              )}
            </div>

            {/* University and Department */}
            <div style={{ marginBottom: spacing[4] }}>
              <UniversityDepartmentSelector
                selectedUniversityId={selectedUniversityId}
                selectedUniversityName={selectedUniversityName}
                selectedUniversityDepartmentId={selectedUniversityDepartmentId}
                onUniversitySelected={handleUniversitySelected}
                onDepartmentSelected={handleDepartmentSelected}
                isRequired={true}
                layout="vertical"
              />
              {errors.university && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.university}
                </p>
              )}
              {errors.department && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[1],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.department}
                </p>
              )}
            </div>

            {/* Password */}
            <FormInput
              label="Password"
              type="password"
              placeholder="Create a strong password (min 8 characters)"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              icon={Lock}
              required
            />

            {/* Confirm Password */}
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              icon={Lock}
              required
            />

            {/* Terms and Privacy Checkboxes */}
            <div style={{ marginBottom: spacing[4] }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  marginBottom: spacing[3],
                }}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  style={{
                    marginTop: '2px',
                    marginRight: spacing[2],
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    fontFamily: 'Inter',
                  }}
                >
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    style={{
                      color: colors.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    style={{
                      color: colors.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={allowEmails}
                  onChange={(e) => setAllowEmails(e.target.checked)}
                  style={{
                    marginTop: '2px',
                    marginRight: spacing[2],
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    fontFamily: 'Inter',
                  }}
                >
                  I want to receive updates and newsletters
                </span>
              </label>

              {errors.terms && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.error,
                    margin: 0,
                    marginTop: spacing[2],
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? colors.border : colors.primary,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: spacing[4],
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: 'Inter',
              }}
            >
              Already have an account?{' '}
              <Link
                to="/sign-in"
                style={{
                  color: colors.primary,
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
