import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { FormInput } from '../FormInput';
import { ReviewService } from '../../services/reviewService';
import { useTranslation } from '../../i18n';
import Modal from '../Modal';

const AddResearchGroupModal = ({ departmentId, onClose, onAdd }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
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
      newErrors.name = t('writeReview.modals.addResearchGroup.validation.nameRequired', 'Research group name is required');
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
      const researchGroup = await ReviewService.addResearchGroup(departmentId, formData);
      onAdd(researchGroup);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div>
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
            {t('writeReview.modals.addResearchGroup.title', 'Add New Research Group')}
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
          {/* Research Group Name */}
          <FormInput
            label={t('writeReview.modals.addResearchGroup.fields.name', 'Research Group Name')}
            value={formData.name}
            onChange={(value) => updateField('name', value)}
            placeholder={t('writeReview.modals.addResearchGroup.placeholders.name', 'e.g., AI Research Lab')}
            error={errors.name}
            required
            style={{ marginBottom: spacing[4] }}
          />

          {/* Website */}
          <FormInput
            label={t('writeReview.modals.addResearchGroup.fields.website', 'Website (Optional)')}
            value={formData.website}
            onChange={(value) => updateField('website', value)}
            placeholder={t('writeReview.modals.addResearchGroup.placeholders.website', 'e.g., https://ai.stanford.edu')}
            error={errors.website}
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
              {t('writeReview.modals.addResearchGroup.fields.description', 'Description (Optional)')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('writeReview.modals.addResearchGroup.placeholders.description', 'Brief description of the research group')}
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
              {t('writeReview.modals.addResearchGroup.buttons.cancel', 'Cancel')}
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
                  {t('writeReview.modals.addResearchGroup.buttons.adding', 'Adding...')}
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  {t('writeReview.modals.addResearchGroup.buttons.add', 'Add Research Group')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddResearchGroupModal;
