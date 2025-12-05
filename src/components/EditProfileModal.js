import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Mail, Save, Loader, Search } from 'lucide-react';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { UniversityService } from '../services/universityService';
import { useBreakpoint } from '../hooks/useBreakpoint';
import UniversityDepartmentSelector from './UniversityDepartmentSelector';
import Modal from './Modal';
import AddLabModal from './AddLabModal';

const EditProfileModal = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    position: '',
    universityId: '',
    universityName: '',
    departmentId: '',
    departmentName: '',
    professorId: '',
    labId: '',
    labName: '',
    is_lab_member: false,
    can_provide_services: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
  const [showProfessorDropdown, setShowProfessorDropdown] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const { isMobile } = useBreakpoint();


  useEffect(() => {
    if (isOpen && user) {
      // Initialize form with user data
      setFormData({
        email: user.email || '',
        username: user.username || '',
        name: user.name || '',
        position: user.position || '',
        universityId: user.university || '',
        universityName: user.university_name || '',
        departmentId: user.university_department || '',
        departmentName: user.department || '',
        professorId: user.professor_id || '',
        labId: user.lab_id || '',
        labName: user.lab_name || '',
        is_lab_member: user.is_lab_member || false,
        can_provide_services: user.can_provide_services || false
      });
    }
  }, [isOpen, user]);

  const handleUniversitySelected = (universityId, universityName) => {
    console.log('University selected:', universityId, universityName);
    setFormData(prev => ({
      ...prev,
      universityId: String(universityId),
      universityName: String(universityName),
      // Clear dependent fields
      departmentId: '',
      departmentName: '',
      professorId: '',
      labId: '',
      labName: ''
    }));
  };

  const handleDepartmentSelected = async (departmentId, departmentName) => {
    console.log('Department selected:', departmentId, departmentName);
    setFormData(prev => ({
      ...prev,
      departmentId: String(departmentId),
      departmentName: String(departmentName),
      // Clear dependent fields
      professorId: '',
      labId: '',
      labName: ''
    }));

    // Load professors for the selected department
    if (departmentId && formData.universityId) {
      loadProfessors({
        university: formData.universityId,
        university_department: departmentId
      });
    }
  };

  const handleLabAdded = (lab) => {
    setShowAddLabModal(false);
    if (!lab) return;

    const professor = lab.professor || {};
    const labName = lab.name || lab.labName || formData.labName;
    const professorName = professor.name || lab.professorName || labName;

    // Add to dropdown options for future selection
    if (professor.id || lab.professor_id) {
      const professorEntry = {
        id: professor.id || lab.professor_id,
        name: professorName,
        lab: { id: lab.id, name: labName },
        university_department_name: formData.departmentName
      };
      setProfessors(prev => [...prev, professorEntry]);
      setFilteredProfessors(prev => [...prev, professorEntry]);
    }

    setFormData(prev => ({
      ...prev,
      professorId: professor.id || lab.professor_id || prev.professorId,
      labId: lab.id || prev.labId,
      labName: labName || prev.labName
    }));
  };

  const loadProfessors = useCallback(async (filters = {}) => {
    if (!filters.university && !formData.universityId) {
      setProfessors([]);
      setFilteredProfessors([]);
      return;
    }

    setIsLoadingProfessors(true);
    try {
      const professorFilters = {
        university: filters.university || formData.universityId,
        ...(filters.university_department || formData.departmentId ? {
          university_department: filters.university_department || formData.departmentId
        } : {})
      };

      const professorData = await UniversityService.getProfessors(professorFilters);
      setProfessors(professorData || []);
      setFilteredProfessors(professorData || []);
    } catch (error) {
      console.error('❌ Error loading professors:', error);
      setProfessors([]);
      setFilteredProfessors([]);
    } finally {
      setIsLoadingProfessors(false);
    }
  }, [formData.universityId, formData.departmentId]);

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

    // Handle professor/lab search
    if (name === 'labName') {
      setFormData(prev => ({
        ...prev,
        professorId: '', // Clear professor ID when typing
        labId: '' // Clear lab ID when typing
      }));

      // Filter professors based on search term
      if (value) {
        const filtered = professors.filter(professor =>
          professor.name.toLowerCase().includes(value.toLowerCase()) ||
          (professor.lab && professor.lab.name && professor.lab.name.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredProfessors(filtered);
        setShowProfessorDropdown(filtered.length > 0);
      } else {
        setFilteredProfessors(professors);
        setShowProfessorDropdown(false);
      }
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

    if (!formData.departmentId) {
      newErrors.departmentId = 'University department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfessorSelect = (professor) => {
    const displayName = professor.lab && professor.lab.name
      ? `${professor.name} - ${professor.lab.name}`
      : professor.name;

    setFormData(prev => ({
      ...prev,
      professorId: professor.id,
      labId: professor.lab ? professor.lab.id : '',
      labName: displayName
    }));
    setShowProfessorDropdown(false);
  };

  const handleProfessorInputFocus = () => {
    setShowProfessorDropdown(true);
    setFilteredProfessors(professors);
  };

  const handleProfessorInputBlur = () => {
    // Delay hiding dropdown to allow clicks
    setTimeout(() => setShowProfessorDropdown(false), 200);
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
        lab_name: formData.labName,
        is_lab_member: formData.is_lab_member,
        can_provide_services: formData.can_provide_services
      };

      // Include university and university_department if selected
      if (formData.universityId) {
        updateData.university = parseInt(formData.universityId, 10);
      }
      if (formData.departmentId) {
        updateData.university_department = parseInt(formData.departmentId, 10);
      }

      // Include professor/lab if selected
      if (formData.professorId) {
        updateData.professor_id = parseInt(formData.professorId, 10);
      }
      if (formData.labId) {
        updateData.lab_id = parseInt(formData.labId, 10);
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
      <div>
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
                disabled={true}
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
              disabled={true}
              style={{ marginBottom: spacing[4] }}
            />

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

            <UniversityDepartmentSelector
              selectedUniversityId={formData.universityId}
              selectedUniversityName={formData.universityName}
              selectedUniversityDepartmentId={formData.departmentId}
              onUniversitySelected={handleUniversitySelected}
              onDepartmentSelected={handleDepartmentSelected}
              isRequired={true}
              layout="responsive"
              error={errors.departmentId}
            />

            {errors.departmentId && (
              <div style={{
                color: colors.error,
                fontSize: '12px',
                marginTop: spacing[1],
                fontFamily: 'Inter'
              }}>
                {errors.departmentId}
              </div>
            )}

            {/* Professor/Lab Selection */}
            {formData.universityId && (
              <div style={{ marginTop: spacing[4] }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Professor/Lab (Optional)
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="labName"
                    value={formData.labName}
                    onChange={handleInputChange}
                    onFocus={handleProfessorInputFocus}
                    onBlur={handleProfessorInputBlur}
                    placeholder={formData.universityId
                      ? 'Search professor or lab name...'
                      : 'Please select a university first'
                    }
                    disabled={!formData.universityId}
                    style={{
                      width: '100%',
                      height: '56px',
                      padding: `0 ${spacing[4]} 0 ${spacing[4]}`,
                      paddingRight: '48px',
                      fontSize: '14px',
                      border: `2px solid ${colors.border}`,
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      fontFamily: 'Inter',
                      cursor: formData.universityId ? 'text' : 'not-allowed',
                      opacity: !formData.universityId ? 0.6 : 1
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    right: spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: formData.labName ? 'pointer' : 'default'
                  }}>
                    {isLoadingProfessors ? (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: `2px solid ${colors.border}`,
                        borderTop: `2px solid ${colors.primary}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : formData.labName ? (
                      <X
                        size={20}
                        color={colors.textSecondary}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, labName: '', professorId: '', labId: '' }));
                          setShowProfessorDropdown(false);
                        }}
                      />
                    ) : (
                      <Search size={20} color={colors.textSecondary} />
                    )}
                  </div>

                  {/* Professor Dropdown */}
                    {showProfessorDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                      backgroundColor: 'white',
                      border: `2px solid ${colors.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      zIndex: 1000,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}>
                      {filteredProfessors.length > 0 ? (
                        filteredProfessors.map((professor) => {
                          const displayName = professor.lab && professor.lab.name
                            ? `${professor.name} - ${professor.lab.name}`
                            : professor.name;

                          return (
                            <div
                              key={professor.id}
                              onClick={() => handleProfessorSelect(professor)}
                              style={{
                                padding: `${spacing[3]} ${spacing[4]}`,
                                cursor: 'pointer',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                fontFamily: 'Inter',
                                color: colors.textPrimary,
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#E8E8E8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                              }}
                            >
                              <div style={{ fontWeight: '500', color: colors.textPrimary }}>
                                {displayName}
                              </div>
                              {professor.university_department_name && (
                                <div style={{
                                  fontSize: '12px',
                                  color: colors.textSecondary,
                                  marginTop: spacing[1]
                                }}>
                                  {professor.university_department_name}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{
                          padding: `${spacing[3]} ${spacing[4]}`,
                          fontSize: '14px',
                          color: colors.textSecondary,
                          fontFamily: 'Inter'
                        }}>
                          No matching professors or labs
                        </div>
                      )}

                      <div
                        onClick={() => {
                          setShowProfessorDropdown(false);
                          setShowAddLabModal(true);
                        }}
                        style={{
                          padding: `${spacing[3]} ${spacing[4]}`,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: 'Inter',
                          color: colors.primary,
                          borderTop: `1px solid ${colors.border}`,
                          backgroundColor: 'white',
                          fontWeight: 600
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.backgroundLight || '#F3F4F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        + Add Professor/Lab
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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

        <AddLabModal
          isOpen={showAddLabModal}
          onClose={() => setShowAddLabModal(false)}
          selectedUniversity={{
            id: formData.universityId,
            name: formData.universityName
          }}
          selectedDepartment={{
            id: formData.departmentId,
            name: formData.departmentName
          }}
          selectedResearchGroup={null}
          onLabAdded={handleLabAdded}
          showUniversitySelector={false}
        />
      </div>
    </Modal>
  );
};

// Form Field Component
const FormField = ({ label, name, value, onChange, error, icon: Icon, required, type = 'text', placeholder, style, disabled = false }) => {
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
          disabled={disabled}
          style={{
            width: '100%',
            border: `1px solid ${error ? colors.error : colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[3]} ${Icon ? spacing[10] : spacing[3]}`,
            fontSize: '14px',
            backgroundColor: disabled ? colors.backgroundSecondary : 'white',
            color: disabled ? colors.textSecondary : colors.textPrimary,
            cursor: disabled ? 'not-allowed' : 'text',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            opacity: disabled ? 0.7 : 1,
            ':focus': {
              borderColor: disabled ? colors.border : colors.primary
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
