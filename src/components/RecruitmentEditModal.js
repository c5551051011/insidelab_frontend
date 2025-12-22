import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, spacing } from '../theme';

const RecruitmentEditModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    phd: false,
    postdoc: false,
    intern: false,
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when modal opens or initial data changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        phd: initialData.is_recruiting_phd || initialData.phd || false,
        postdoc: initialData.is_recruiting_postdoc || initialData.postdoc || false,
        intern: initialData.is_recruiting_intern || initialData.intern || false,
        notes: initialData.notes || ''
      });
    }
  }, [isOpen, initialData]);

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNotesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving recruitment status:', error);
      // Error will be handled by parent component
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: spacing[6],
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[5]
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Edit Recruitment Status
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[2],
              color: colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Recruitment Positions */}
          <div style={{ marginBottom: spacing[5] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing[3]
            }}>
              Open Positions
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3]
            }}>
              {/* PhD Students */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                cursor: 'pointer',
                padding: spacing[3],
                borderRadius: '8px',
                border: `2px solid ${formData.phd ? colors.primary : colors.border}`,
                backgroundColor: formData.phd ? `${colors.primary}10` : 'white',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  checked={formData.phd}
                  onChange={() => handleCheckboxChange('phd')}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: colors.primary
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  PhD Students
                </span>
              </label>

              {/* Postdocs */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                cursor: 'pointer',
                padding: spacing[3],
                borderRadius: '8px',
                border: `2px solid ${formData.postdoc ? colors.primary : colors.border}`,
                backgroundColor: formData.postdoc ? `${colors.primary}10` : 'white',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  checked={formData.postdoc}
                  onChange={() => handleCheckboxChange('postdoc')}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: colors.primary
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Postdocs
                </span>
              </label>

              {/* Undergraduate Interns */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                cursor: 'pointer',
                padding: spacing[3],
                borderRadius: '8px',
                border: `2px solid ${formData.intern ? colors.primary : colors.border}`,
                backgroundColor: formData.intern ? `${colors.primary}10` : 'white',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  checked={formData.intern}
                  onChange={() => handleCheckboxChange('intern')}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: colors.primary
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Undergraduate Interns
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Add any additional information about recruitment (e.g., application deadlines, specific requirements, contact information)"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: spacing[3],
                fontSize: '15px',
                color: colors.textPrimary,
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
              }}
            />
            <p style={{
              fontSize: '13px',
              color: colors.textTertiary,
              margin: 0,
              marginTop: spacing[2]
            }}>
              This information will be visible to all users viewing the lab page.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textSecondary,
                backgroundColor: 'white',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isSaving ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = colors.background;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: colors.primary,
                border: 'none',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isSaving ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentEditModal;
