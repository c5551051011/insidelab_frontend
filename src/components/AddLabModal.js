import React, { useState, useEffect } from 'react';
import { X, Globe, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';

const AddLabModal = ({ isOpen, onClose, selectedUniversity, selectedDepartment, onLabAdded }) => {
  const [formData, setFormData] = useState({
    labName: '',
    professorName: '',
    labWebsite: ''
  });
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      labName: '',
      professorName: '',
      labWebsite: ''
    });
    setErrors({});
    setVerificationStatus(null);
    setIsVerifying(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const verifyWebsite = async (url) => {
    if (!url || !validateUrl(url)) {
      setVerificationStatus('invalid');
      return false;
    }

    setIsVerifying(true);
    try {
      // Simulate website verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simple validation - check if it looks like an academic website
      const domain = new URL(url).hostname.toLowerCase();
      const isAcademic = domain.includes('.edu') ||
                        domain.includes('university') ||
                        domain.includes('research') ||
                        domain.includes('.ac.');

      if (isAcademic) {
        setVerificationStatus('verified');
        return true;
      } else {
        setVerificationStatus('warning');
        return true; // Allow but warn
      }
    } catch (error) {
      setVerificationStatus('failed');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWebsiteChange = async (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, labWebsite: url }));
    setErrors(prev => ({ ...prev, labWebsite: '' }));

    if (url) {
      await verifyWebsite(url);
    } else {
      setVerificationStatus(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.labName.trim()) {
      newErrors.labName = 'Lab name is required';
    }

    if (!formData.professorName.trim()) {
      newErrors.professorName = 'Professor name is required';
    }

    if (!formData.labWebsite.trim()) {
      newErrors.labWebsite = 'Lab website is required';
    } else if (!validateUrl(formData.labWebsite)) {
      newErrors.labWebsite = 'Please enter a valid URL (including https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (verificationStatus === 'failed' || verificationStatus === 'invalid') {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the lab/professor
      const newLab = await UniversityService.addLabAndProfessor({
        labName: formData.labName.trim(),
        professorName: formData.professorName.trim(),
        labWebsite: formData.labWebsite.trim(),
        universityId: selectedUniversity.id,
        departmentId: selectedDepartment.id
      });

      onLabAdded(newLab);
      onClose();
    } catch (error) {
      console.error('Error adding lab:', error);
      setErrors({ submit: 'Failed to add lab. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle size={16} color={colors.success} />;
      case 'warning':
        return <AlertCircle size={16} color={colors.warning} />;
      case 'failed':
      case 'invalid':
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return null;
    }
  };

  const getVerificationMessage = () => {
    switch (verificationStatus) {
      case 'verified':
        return { text: 'Academic website verified', color: colors.success };
      case 'warning':
        return { text: 'Website accessible but not academic domain', color: colors.warning };
      case 'failed':
        return { text: 'Website not accessible', color: colors.error };
      case 'invalid':
        return { text: 'Invalid URL format', color: colors.error };
      default:
        return null;
    }
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
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: spacing[6],
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing[1]
            }}>
              Add New Lab/Professor
            </h2>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0
            }}>
              {selectedUniversity?.name} • {selectedDepartment?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[2],
              borderRadius: '6px',
              color: colors.textTertiary
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[6] }}>
          {/* Lab Name */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Lab Name *
            </label>
            <input
              type="text"
              value={formData.labName}
              onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
              placeholder="Enter lab name"
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${errors.labName ? colors.error : colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter',
                outline: 'none'
              }}
            />
            {errors.labName && (
              <p style={{
                fontSize: '12px',
                color: colors.error,
                margin: `${spacing[1]} 0 0 0`
              }}>
                {errors.labName}
              </p>
            )}
          </div>

          {/* Professor Name */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Professor Name *
            </label>
            <input
              type="text"
              value={formData.professorName}
              onChange={(e) => setFormData(prev => ({ ...prev, professorName: e.target.value }))}
              placeholder="Enter professor's full name"
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${errors.professorName ? colors.error : colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter',
                outline: 'none'
              }}
            />
            {errors.professorName && (
              <p style={{
                fontSize: '12px',
                color: colors.error,
                margin: `${spacing[1]} 0 0 0`
              }}>
                {errors.professorName}
              </p>
            )}
          </div>

          {/* Lab Website */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Lab Website *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={formData.labWebsite}
                onChange={handleWebsiteChange}
                placeholder="https://lab.university.edu"
                style={{
                  width: '100%',
                  padding: spacing[3],
                  paddingLeft: spacing[10],
                  border: `1px solid ${errors.labWebsite ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              <Globe
                size={16}
                color={colors.textTertiary}
                style={{
                  position: 'absolute',
                  left: spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              {isVerifying && (
                <Loader
                  size={16}
                  color={colors.primary}
                  style={{
                    position: 'absolute',
                    right: spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}
              {!isVerifying && getVerificationIcon() && (
                <div style={{
                  position: 'absolute',
                  right: spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  {getVerificationIcon()}
                </div>
              )}
            </div>

            {errors.labWebsite && (
              <p style={{
                fontSize: '12px',
                color: colors.error,
                margin: `${spacing[1]} 0 0 0`
              }}>
                {errors.labWebsite}
              </p>
            )}

            {getVerificationMessage() && (
              <p style={{
                fontSize: '12px',
                color: getVerificationMessage().color,
                margin: `${spacing[1]} 0 0 0`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1]
              }}>
                {getVerificationMessage().text}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: spacing[3],
              backgroundColor: `${colors.error}10`,
              border: `1px solid ${colors.error}30`,
              borderRadius: '8px',
              marginBottom: spacing[5]
            }}>
              <p style={{
                fontSize: '14px',
                color: colors.error,
                margin: 0
              }}>
                {errors.submit}
              </p>
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
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'white',
                color: colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isVerifying || verificationStatus === 'failed' || verificationStatus === 'invalid'}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting || isVerifying ? colors.textTertiary : colors.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || isVerifying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
            >
              {isSubmitting && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {isSubmitting ? 'Adding...' : 'Add Lab'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddLabModal;