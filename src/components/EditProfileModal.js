import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building2, GraduationCap, Globe, Save, Loader } from 'lucide-react';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { UniversityService } from '../services/universityService';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Modal from './Modal';

const EditProfileModal = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    position: '',
    language: 'en',
    university_department: '',
    department: '',
    lab_name: '',
    is_lab_member: false,
    can_provide_services: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const { isMobile } = useBreakpoint();

  // Position options
  const positionOptions = [
    'Undergraduate Student',
    'Graduate Student',
    'PhD Student',
    'Postdoc',
    'Research Assistant',
    'Research Associate',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Lab Manager',
    'Staff Scientist',
    'Other'
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' }
  ];

  useEffect(() => {
    if (isOpen && user) {
      // Initialize form with user data
      setFormData({
        email: user.email || '',
        username: user.username || '',
        name: user.name || '',
        position: user.position || '',
        language: user.language || 'en',
        university_department: user.university_department || '',
        department: user.department || '',
        lab_name: user.lab_name || '',
        is_lab_member: user.is_lab_member || false,
        can_provide_services: user.can_provide_services || false
      });

      // Load universities
      loadUniversities();

      // Load departments if university is selected
      if (user.university_department) {
        loadDepartments(user.university_department);
      }
    }
  }, [isOpen, user]);

  const loadUniversities = async () => {
    try {
      const response = await UniversityService.getUniversities();
      setUniversities(response || []);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadDepartments = async (universityId) => {
    try {
      setLoadingDepartments(true);
      const response = await UniversityService.getDepartments(universityId);
      setDepartments(response || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Load departments when university changes
    if (name === 'university_department' && value) {
      loadDepartments(value);
      setFormData(prev => ({
        ...prev,
        department: '' // Reset department when university changes
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const updateData = {
        email: formData.email,
        username: formData.username,
        name: formData.name,
        position: formData.position,
        language: formData.language,
        lab_name: formData.lab_name,
        is_lab_member: formData.is_lab_member,
        can_provide_services: formData.can_provide_services
      };

      // Include university_department if selected
      if (formData.university_department) {
        updateData.university_department = parseInt(formData.university_department);
      }

      // Include department if provided (legacy field)
      if (formData.department) {
        updateData.department = formData.department;
      }

      const updatedUser = await AuthService.updateProfile(updateData);

      // Update user in parent component
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      maxWidth={isMobile ? '100%' : '600px'}
      maxHeight="90vh"
      padding={0}
      contentStyle={{
        borderRadius: '16px',
        backgroundColor: 'white',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}
    >
        {/* Header */}
        <div style={{
          padding: spacing[6],
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color={colors.primary} />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.textPrimary,
                margin: 0,
                marginBottom: spacing[1]
              }}>
                Edit Profile
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0
              }}>
                Update your account information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: spacing[2],
              cursor: 'pointer',
              color: colors.textSecondary,
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[6] }}>
          {/* Basic Information */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4]
            }}>
              Basic Information
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: spacing[4],
              marginBottom: spacing[4]
            }}>
              <FormField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                icon={User}
                required
              />

              <FormField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                icon={User}
                required
              />
            </div>

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              icon={Mail}
              required
              style={{ marginBottom: spacing[4] }}
            />

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: spacing[4]
            }}>
              <FormSelect
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                options={positionOptions.map(pos => ({ value: pos, label: pos }))}
                icon={GraduationCap}
              />

              <FormSelect
                label="Language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                options={languageOptions}
                icon={Globe}
              />
            </div>
          </div>

          {/* University Information */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4]
            }}>
              University Information
            </h3>

            <FormSelect
              label="University"
              name="university_department"
              value={formData.university_department}
              onChange={handleInputChange}
              options={universities.map(uni => ({
                value: uni.id.toString(),
                label: uni.name
              }))}
              icon={Building2}
              style={{ marginBottom: spacing[4] }}
            />

            {formData.university_department && (
              <FormSelect
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                options={departments.map(dept => ({
                  value: dept.name,
                  label: dept.name
                }))}
                icon={GraduationCap}
                loading={loadingDepartments}
                style={{ marginBottom: spacing[4] }}
              />
            )}

            <FormField
              label="Lab Name"
              name="lab_name"
              value={formData.lab_name}
              onChange={handleInputChange}
              icon={Building2}
              placeholder="Enter your lab name (optional)"
            />
          </div>

          {/* Additional Settings */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4]
            }}>
              Additional Settings
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3]
            }}>
              <FormCheckbox
                label="I am a lab member"
                name="is_lab_member"
                checked={formData.is_lab_member}
                onChange={handleInputChange}
                description="Check if you are currently affiliated with a research lab"
              />

              <FormCheckbox
                label="I can provide services"
                name="can_provide_services"
                checked={formData.can_provide_services}
                onChange={handleInputChange}
                description="Check if you can provide consultation or mentoring services"
              />
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div style={{
              backgroundColor: `${colors.error}10`,
              border: `1px solid ${colors.error}30`,
              borderRadius: '8px',
              padding: spacing[3],
              marginBottom: spacing[4]
            }}>
              <div style={{
                fontSize: '14px',
                color: colors.error,
                fontWeight: '500'
              }}>
                {errors.submit}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: `${spacing[3]} ${spacing[6]}`,
                fontSize: '14px',
                fontWeight: '600',
                color: colors.textSecondary,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? colors.textTertiary : colors.primary,
                border: 'none',
                borderRadius: '8px',
                padding: `${spacing[3]} ${spacing[6]}`,
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
    </Modal>
  );
};

// Form Field Component
const FormField = ({ label, name, value, onChange, error, icon: Icon, required, type = 'text', placeholder, style }) => {
  return (
    <div style={style}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        {label} {required && <span style={{ color: colors.error }}>*</span>}
      </label>

      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: spacing[3],
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }}>
            <Icon size={16} color={colors.textTertiary} />
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: `1px solid ${error ? colors.error : colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[3]} ${Icon ? spacing[10] : spacing[3]}`,
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            ':focus': {
              borderColor: colors.primary
            }
          }}
        />
      </div>

      {error && (
        <div style={{
          fontSize: '12px',
          color: colors.error,
          marginTop: spacing[1]
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// Form Select Component
const FormSelect = ({ label, name, value, onChange, options, icon: Icon, loading, style }) => {
  return (
    <div style={style}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: spacing[3],
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }}>
            {loading ? <Loader size={16} className="animate-spin" /> : <Icon size={16} color={colors.textTertiary} />}
          </div>
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={loading}
          style={{
            width: '100%',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[3]} ${Icon ? spacing[10] : spacing[3]}`,
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Form Checkbox Component
const FormCheckbox = ({ label, name, checked, onChange, description }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
      padding: spacing[4],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '8px'
    }}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          marginTop: '2px',
          width: '16px',
          height: '16px',
          accentColor: colors.primary
        }}
      />

      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[1]
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;
