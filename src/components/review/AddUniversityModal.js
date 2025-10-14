import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { FormInput } from '../FormInput';
import { ReviewService } from '../../services/reviewService';

const AddUniversityModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    country: '',
    city: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'University name is required';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is required';
    } else if (!ReviewService.isAcademicDomain(formData.website)) {
      newErrors.website = 'Please enter an academic website (.edu, .ac., etc.)';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const university = await ReviewService.addUniversity(formData);
      onAdd(university);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

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
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: spacing[6],
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[6]
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: 'Inter',
            margin: 0
          }}>
            Add New University
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: spacing[1],
              borderRadius: '6px'
            }}
          >
            <X size={20} color={colors.textSecondary} />
          </button>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[3],
            backgroundColor: colors.error + '10',
            border: `1px solid ${colors.error}`,
            borderRadius: '8px',
            marginBottom: spacing[4]
          }}>
            <AlertCircle size={16} color={colors.error} />
            <span style={{
              fontSize: '14px',
              color: colors.error,
              fontFamily: 'Inter'
            }}>
              {errors.general}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* University Name */}
          <FormInput
            label="University Name"
            value={formData.name}
            onChange={(value) => updateField('name', value)}
            placeholder="e.g., Stanford University"
            error={errors.name}
            required
            style={{ marginBottom: spacing[4] }}
          />

          {/* Website */}
          <FormInput
            label="Official Website"
            value={formData.website}
            onChange={(value) => updateField('website', value)}
            placeholder="e.g., https://www.stanford.edu"
            error={errors.website}
            required
            style={{ marginBottom: spacing[4] }}
          />

          {/* Country */}
          <FormInput
            label="Country"
            value={formData.country}
            onChange={(value) => updateField('country', value)}
            placeholder="e.g., United States"
            error={errors.country}
            required
            style={{ marginBottom: spacing[4] }}
          />

          {/* City */}
          <FormInput
            label="City"
            value={formData.city}
            onChange={(value) => updateField('city', value)}
            placeholder="e.g., Stanford"
            error={errors.city}
            required
            style={{ marginBottom: spacing[6] }}
          />

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: submitting ? colors.border : colors.primary,
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1]
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Add University
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUniversityModal;