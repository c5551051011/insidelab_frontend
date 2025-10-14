import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { FormInput } from '../FormInput';
import { ReviewService } from '../../services/reviewService';

const AddDepartmentModal = ({ universityId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    department_name: '',
    description: '',
    local_name: '',
    common_names: '',
    head_name: '',
    website: '',
    established_year: ''
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

    if (!formData.department_name.trim()) {
      newErrors.department_name = 'Department name is required';
    }

    if (formData.website && !isValidURL(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.established_year && (isNaN(formData.established_year) || formData.established_year < 1800 || formData.established_year > new Date().getFullYear())) {
      newErrors.established_year = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data according to API format
      const apiData = {
        department_name: formData.department_name.trim(),
        description: formData.description.trim() || undefined,
        local_name: formData.local_name.trim() || undefined,
        common_names: formData.common_names ? formData.common_names.split(',').map(name => name.trim()).filter(name => name) : undefined,
        head_name: formData.head_name.trim() || undefined,
        website: formData.website.trim() || undefined,
        established_year: formData.established_year ? parseInt(formData.established_year) : undefined
      };

      // Remove undefined fields
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined) {
          delete apiData[key];
        }
      });

      const department = await ReviewService.addDepartment(universityId, apiData);
      onAdd(department);
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
            Add New Department
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
          {/* Department Name */}
          <FormInput
            label="Department Name"
            value={formData.department_name}
            onChange={(value) => updateField('department_name', value)}
            placeholder="e.g., Computer Science"
            error={errors.department_name}
            required
            style={{ marginBottom: spacing[4] }}
          />

          {/* Local Name */}
          <FormInput
            label="Local Name (Optional)"
            value={formData.local_name}
            onChange={(value) => updateField('local_name', value)}
            placeholder="e.g., 컴퓨터과학과"
            error={errors.local_name}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Common Names */}
          <FormInput
            label="Common Names (Optional)"
            value={formData.common_names}
            onChange={(value) => updateField('common_names', value)}
            placeholder="e.g., CS, 전산학과 (comma-separated)"
            error={errors.common_names}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Head Name */}
          <FormInput
            label="Department Head (Optional)"
            value={formData.head_name}
            onChange={(value) => updateField('head_name', value)}
            placeholder="e.g., Dr. John Smith"
            error={errors.head_name}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Website */}
          <FormInput
            label="Website (Optional)"
            value={formData.website}
            onChange={(value) => updateField('website', value)}
            placeholder="e.g., https://cs.kaist.ac.kr"
            error={errors.website}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Established Year */}
          <FormInput
            label="Established Year (Optional)"
            value={formData.established_year}
            onChange={(value) => updateField('established_year', value)}
            placeholder="e.g., 1980"
            error={errors.established_year}
            type="number"
            style={{ marginBottom: spacing[4] }}
          />

          {/* Description */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the department"
              rows={3}
              style={{
                width: '100%',
                padding: spacing[3],
                fontSize: '14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter',
                resize: 'vertical'
              }}
            />
          </div>

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
                  Add Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;