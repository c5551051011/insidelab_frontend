import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, RefreshCw, Info, Check } from 'lucide-react';
import Header from '../components/Header';
import { FormInput } from '../components/FormInput';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { ApiException } from '../services/apiService';
import { UniversityService } from '../services/universityService';
import { ReviewService } from '../services/reviewService';

const SignupPage = () => {
  const navigate = useNavigate();
const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    position: '',
    university: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [allowEmails, setAllowEmails] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Generate random username and load universities on component mount
  useEffect(() => {
    generateRandomUsername();
    loadUniversities();
  }, []);

  // Load all departments when component mounts (new approach)
  useEffect(() => {
    loadAllDepartments();
  }, []);

  const loadUniversities = async () => {
    try {
      const universitiesList = await UniversityService.getAllUniversities();
      setUniversities(universitiesList);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadAllDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const departmentsList = await UniversityService.getAllDepartments();

      // Safely process departments to avoid React Error #31
      const processedDepartments = departmentsList.map((dept, index) => {
        console.log(`🔍 Processing department ${index}:`, typeof dept, dept);

        // Handle null/undefined
        if (!dept) {
          console.warn(`⚠️ Null/undefined department at index ${index}`);
          return {
            id: `fallback-${index}`,
            name: 'Unknown Department',
            department_name: 'Unknown Department'
          };
        }

        // Handle string
        if (typeof dept === 'string') {
          return {
            id: dept,
            name: dept,
            department_name: dept
          };
        }

        // Handle complex object - extract only safe primitive values
        const safeId = String(dept.id || dept.department?.id || `dept-${index}`);
        const safeName = String(dept.department_name || dept.name || dept.display_name || 'Unknown Department');

        const processed = {
          id: safeId,
          name: safeName,
          department_name: safeName
        };

        console.log(`✅ Processed department ${index}:`, processed);
        return processed;
      });

      setDepartments(processedDepartments);
      console.log('📋 All departments loaded and processed:', processedDepartments);
    } catch (error) {
      console.error('Error loading all departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = [
      'Smart', 'Bright', 'Quick', 'Swift', 'Sharp', 'Wise', 'Bold', 'Cool',
      'Fast', 'Strong', 'Clear', 'Fresh', 'Young', 'New', 'Pure', 'True',
      'Deep', 'High', 'Wild', 'Free', 'Safe', 'Easy', 'Fine', 'Good',
      'Kind', 'Nice', 'Calm', 'Fair', 'Real', 'Rich', 'Soft', 'Warm'
    ];

    const nouns = [
      'Scholar', 'Student', 'Learner', 'Thinker', 'Reader', 'Writer', 'Seeker',
      'Explorer', 'Finder', 'Builder', 'Maker', 'Creator', 'Helper', 'Leader',
      'Dreamer', 'Planner', 'Doer', 'Walker', 'Runner', 'Climber', 'Flyer',
      'Star', 'Moon', 'Sun', 'River', 'Ocean', 'Mountain', 'Forest', 'Garden',
      'Bridge', 'Tower', 'Castle', 'House', 'Path', 'Journey', 'Quest', 'Goal'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    const username = `${adjective}${noun}${number}`;
    setFormData(prev => ({ ...prev, username }));
  };



  const handleAddUniversity = async (universityData) => {
    try {
      const newUniversity = await UniversityService.addUniversity(universityData);
      setUniversities(prev => [...prev, newUniversity]);
      setFormData(prev => ({ ...prev, university: newUniversity.id }));
      setShowAddUniversity(false);
      // Refresh departments list after adding new university
      await loadAllDepartments();
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Failed to add university. Please try again.');
    }
  };

  const handleAddDepartment = async (departmentData) => {
    try {
      console.log('🏫 Adding department:', departmentData.name, 'to university:', formData.university);

      // Check if department already exists (safely)
      const existingDepartment = departments.find(dept => {
        const deptName = dept?.department_name || dept?.name || '';
        return deptName === departmentData.name;
      });

      if (existingDepartment) {
        console.log('✅ Department already exists, using existing:', existingDepartment);
        // Use existing department
        const safeExistingId = String(existingDepartment.id);
        console.log('🔗 Setting existing department ID:', safeExistingId);
        setFormData(prev => ({ ...prev, department: safeExistingId }));
        setShowAddDepartment(false);
        return;
      }

      // Add new department
      const response = await ReviewService.addDepartment(formData.university, {
        department_name: departmentData.name
      });

      console.log('✅ Department added response:', response);

      // Safely extract department info from response
      const newDepartment = {
        id: response?.id || response?.department?.id || Date.now().toString(),
        name: response?.department_name || response?.name || departmentData.name,
        department_name: response?.department_name || response?.name || departmentData.name,
        university_id: formData.university,
        university_name: universities.find(u => u.id == formData.university)?.name || 'Unknown University'
      };

      console.log('📝 Processed new department:', newDepartment);

      setDepartments(prev => {
        console.log('🔄 Previous departments:', prev);
        console.log('➕ Adding new department:', newDepartment);

        const updatedDepartments = [...prev, newDepartment];
        console.log('✅ Updated departments:', updatedDepartments);

        return updatedDepartments;
      });
      const safeDeptId = String(newDepartment.id);
      console.log('🔗 Setting department ID:', safeDeptId);
      setFormData(prev => ({ ...prev, department: safeDeptId }));
      setShowAddDepartment(false);

    } catch (error) {
      console.error('❌ Error adding department:', error);

      // Handle duplicate department error gracefully
      if (error.message && error.message.includes('non_field_errors')) {
        console.log('🔄 Department already exists in university, searching for it...');

        // Reload departments to get the updated list
        await loadAllDepartments();

        // Find the department that was attempted to be added (safely)
        const existingDept = departments.find(dept => {
          const deptName = dept?.department_name || dept?.name || '';
          return deptName === departmentData.name;
        });

        if (existingDept) {
          const safeExistingDeptId = String(existingDept.id);
          console.log('🔗 Setting found department ID:', safeExistingDeptId);
          setFormData(prev => ({ ...prev, department: safeExistingDeptId }));
          setShowAddDepartment(false);
          return;
        }
      }

      alert('Failed to add department. Please try again.');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;

    if (field === 'university' && value === 'Add New University') {
      setShowAddUniversity(true);
      return;
    }

    if (field === 'department' && value === 'Add New Department') {
      setShowAddDepartment(true);
      return;
    }

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username) {
      newErrors.username = 'Please choose a username';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    if (!formData.name) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.position) {
      newErrors.position = 'Please select your position';
    }

if (!formData.university) {
      newErrors.university = 'Please select your university';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
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
      console.log('Sign up with:', formData);

      const response = await AuthService.register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        name: formData.name.trim(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        position: formData.position,
        university_department: formData.university,
        department: formData.department,
        language: 'en', // Default to English
      });

      console.log('Sign up successful:', response);

      // Show success message based on backend response
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

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      console.log('Google sign up - starting...');

      // For now, show message that Google Sign-Up needs frontend Google integration
      alert('Google Sign-Up functionality requires Google OAuth setup. Please use email/password sign-up for now.');

    } catch (error) {
      console.error('Google sign up error:', error);
      alert('Google Sign-Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const positions = [
    'PhD Student',
    'MS Student',
    'Undergrad',
    'PostDoc',
    'Research Assistant',
    'faculty',
  ];


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
            <FormInput
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              icon={Mail}
              required
            />

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
                Username (Anonymous) <span style={{ color: colors.error }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <User
                    size={20}
                    style={{
                      position: 'absolute',
                      left: spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.textTertiary,
                      zIndex: 1,
                    }}
                  />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    placeholder="Auto-generated for privacy"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: `0 ${spacing[3]} 0 48px`,
                      fontSize: isMobile ? '14px' : '16px',
                      border: `2px solid ${errors.username ? colors.error : colors.border}`,
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      fontFamily: 'Inter',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
<button
                  type="button"
                  onClick={generateRandomUsername}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: colors.primary + '1A',
                    border: 'none',
                    borderRadius: '50%',
                    color: colors.primary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title="Generate new username"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary + '33';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary + '1A';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              {errors.username && (
                <p
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    color: colors.error,
                    marginTop: spacing[1],
                    marginBottom: 0,
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Privacy Notice for Username */}
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.info + '1A',
                border: `1px solid ${colors.info}4D`,
                borderRadius: '8px',
                marginBottom: spacing[4],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
<div
                  style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  <Info size={20} color={colors.info} />
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
                    Privacy Recommendation
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      fontFamily: 'Inter',
                    }}
                  >
                    We recommend using the auto-generated username to protect your privacy. You can change it, but random usernames help keep your reviews anonymous.
                  </div>
                </div>
              </div>
            </div>

            <FormInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              icon={User}
              required
            />

            {/* Position Dropdown */}
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
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.position}
                  onChange={handleInputChange('position')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: `0 ${isMobile ? '32px' : '40px'} 0 ${spacing[3]}`,
                    fontSize: isMobile ? '14px' : '16px',
                    border: `2px solid ${errors.position ? colors.error : colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '8px' : '12px'} center`,
                    backgroundSize: isMobile ? '10px' : '12px',
                  }}
                >
                  <option value="">Select your position</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              {errors.position && (
                <p
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    color: colors.error,
                    marginTop: spacing[1],
                    marginBottom: 0,
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.position}
                </p>
              )}
            </div>

            {/* University Dropdown */}
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
                University <span style={{ color: colors.error }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.university}
                  onChange={handleInputChange('university')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: `0 ${isMobile ? '32px' : '40px'} 0 ${spacing[3]}`,
                    fontSize: isMobile ? '14px' : '16px',
                    border: `2px solid ${errors.university ? colors.error : colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '8px' : '12px'} center`,
                    backgroundSize: isMobile ? '10px' : '12px',
                  }}
                >
                  <option value="">Select your university</option>
                  {universities.map((university) => (
                    <option key={university.id || university} value={university.id || university}>
                      {university.name || university}
                    </option>
                  ))}
                  <option value="Add New University" style={{ fontStyle: 'italic', color: colors.primary }}>
                    + Add New University
                  </option>
                </select>
              </div>
              {errors.university && (
                <p
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    color: colors.error,
                    marginTop: spacing[1],
                    marginBottom: 0,
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.university}
                </p>
              )}
            </div>

            {/* Department Dropdown */}
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
                Department <span style={{ color: colors.error }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: `0 ${isMobile ? '32px' : '40px'} 0 ${spacing[3]}`,
                    fontSize: isMobile ? '14px' : '16px',
                    border: `2px solid ${errors.department ? colors.error : colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '8px' : '12px'} center`,
                    backgroundSize: isMobile ? '10px' : '12px',
                  }}
                >
                  <option value="">
                    {loadingDepartments ? 'Loading departments...' : 'Select your department'}
                  </option>
                  {departments.map((department, index) => {
                    // Extremely safe department rendering
                    console.log(`🎨 Rendering department ${index}:`, department);

                    // Ensure we have a primitive value
                    const deptId = String(department?.id || `unknown-${index}`);
                    const deptName = String(department?.department_name || department?.name || 'Unknown Department');

                    console.log(`✅ Safe values - ID: "${deptId}", Name: "${deptName}"`);

                    return (
                      <option key={deptId} value={deptId}>
                        {deptName}
                      </option>
                    );
                  })}
                  {formData.university && formData.university !== 'Add New University' && (
                    <option value="Add New Department" style={{ fontStyle: 'italic', color: colors.primary }}>
                      + Add New Department
                    </option>
                  )}
                </select>
              </div>
              {errors.department && (
                <p
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    color: colors.error,
                    marginTop: spacing[1],
                    marginBottom: 0,
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.department}
                </p>
              )}
            </div>

            <FormInput
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              icon={Lock}
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              icon={Lock}
              required
            />

            {/* Terms and Conditions */}
            <div style={{ marginBottom: spacing[4] }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[2],
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  marginBottom: spacing[2],
                }}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: colors.primary,
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: colors.primary, textDecoration: 'none' }}>
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: colors.primary, textDecoration: 'none' }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[2],
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                }}
              >
                <input
                  type="checkbox"
                  checked={allowEmails}
                  onChange={(e) => setAllowEmails(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: colors.primary,
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                />
                <span>Send me helpful emails about new features (optional)</span>
              </label>

              {errors.terms && (
                <p
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    color: colors.error,
                    marginTop: spacing[1],
                    marginBottom: 0,
                    fontFamily: 'Inter',
                  }}
                >
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
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
                'Create Account'
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

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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

          {/* Sign In Link */}
          <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
            <span
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: colors.textSecondary,
                fontFamily: 'Inter',
              }}
            >
              Already have an account?{' '}
            </span>
            <Link
              to="/sign-in"
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
              Sign In
            </Link>
          </div>

          {/* Privacy Note */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.success + '0D',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2] }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                }}
              >
                <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>🔒</span>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: '600',
                    color: colors.success,
                    fontSize: '14px',
                    marginBottom: '8px',
                    fontFamily: 'Inter',
                  }}
                >
                  Your Privacy Matters
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    fontFamily: 'Inter',
                    lineHeight: '1.5',
                  }}
                >
                  • Your real name is never shown<br />
                  • Reviews are posted under your username only<br />
                  • Email is only used for verification
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add University Modal */}
      {showAddUniversity && (
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
          padding: spacing[4],
        }}>
          <AddUniversityModal
            onAdd={handleAddUniversity}
            onCancel={() => setShowAddUniversity(false)}
          />
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
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
          padding: spacing[4],
        }}>
          <AddDepartmentModal
            onAdd={handleAddDepartment}
            onCancel={() => setShowAddDepartment(false)}
          />
        </div>
      )}
    </div>
  );
};

// Add University Modal Component
const AddUniversityModal = ({ onAdd, onCancel }) => {
  const [universityData, setUniversityData] = useState({
    name: '',
    website: '',
    country: '',
    state: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!universityData.name.trim() || !universityData.website.trim()) {
      alert('Please fill in university name and website');
      return;
    }

    setLoading(true);
    try {
      await onAdd(universityData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter',
      }}>
        Add New University
      </h3>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="University Name"
          type="text"
          placeholder="e.g., Stanford University"
          value={universityData.name}
          onChange={(e) => setUniversityData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <FormInput
          label="Website"
          type="text"
          placeholder="e.g., https://www.stanford.edu"
          value={universityData.website}
          onChange={(e) => setUniversityData(prev => ({ ...prev, website: e.target.value }))}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginBottom: spacing[4] }}>
          <FormInput
            label="Country"
            type="text"
            placeholder="e.g., United States"
            value={universityData.country}
            onChange={(e) => setUniversityData(prev => ({ ...prev, country: e.target.value }))}
          />

          <FormInput
            label="State/Province"
            type="text"
            placeholder="e.g., California"
            value={universityData.state}
            onChange={(e) => setUniversityData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>

        <FormInput
          label="City"
          type="text"
          placeholder="e.g., Stanford"
          value={universityData.city}
          onChange={(e) => setUniversityData(prev => ({ ...prev, city: e.target.value }))}
        />

        <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Inter',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: loading ? colors.textTertiary : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter',
            }}
          >
            {loading ? 'Adding...' : 'Add University'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Simple Add Department Modal Component (only department name)
const AddDepartmentModal = ({ onAdd, onCancel }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) {
      alert('Please enter department name');
      return;
    }

    setLoading(true);
    try {
      await onAdd({ name: departmentName.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      maxWidth: '400px',
      width: '100%',
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter',
      }}>
        Add New Department
      </h3>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Department Name"
          type="text"
          placeholder="e.g., Computer Science"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          required
        />

        <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Inter',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: loading ? colors.textTertiary : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter',
            }}
          >
            {loading ? 'Adding...' : 'Add Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;