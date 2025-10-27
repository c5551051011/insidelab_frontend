import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';
import { colors, spacing } from '../theme';

const ResearchInterestsModal = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [researchArea, setResearchArea] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      setResearchArea(user.researchArea || '');
      setSpecialties(user.specialties || []);
      setError('');
    }
  }, [isOpen, user]);

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
      setError('');
    }
  };

  const handleRemoveSpecialty = (index) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await AuthService.updateResearchInterests({
      //   researchArea,
      //   specialties
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update user object
      const updatedUser = {
        ...user,
        researchArea,
        specialties
      };

      onUserUpdate(updatedUser);
      onClose();
    } catch (err) {
      setError('Failed to update research interests. Please try again.');
      console.error('Error updating research interests:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          padding: isMobile ? 0 : spacing[4]
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '24px 24px 0 0' : '16px',
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? '100%' : '600px',
            maxHeight: isMobile ? '90vh' : '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: isMobile ? spacing[5] : spacing[6],
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
                <BookOpen size={20} color={colors.primary} />
              </div>
              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                margin: 0
              }}>
                Research Interests
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: colors.backgroundSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={20} color={colors.textSecondary} />
            </button>
          </div>

          {/* Content */}
          <div style={{
            padding: isMobile ? spacing[5] : spacing[6],
            overflowY: 'auto',
            flex: 1
          }}>
            {error && (
              <div style={{
                padding: spacing[4],
                backgroundColor: '#FEE2E2',
                borderRadius: '8px',
                marginBottom: spacing[6],
                color: '#DC2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Primary Research Area */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                Primary Research Area
              </label>
              <input
                type="text"
                value={researchArea}
                onChange={(e) => setResearchArea(e.target.value)}
                placeholder="e.g., Machine Learning, Bioinformatics, Neuroscience"
                style={{
                  width: '100%',
                  padding: spacing[3],
                  fontSize: '14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  fontFamily: 'Inter',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
              <p style={{
                fontSize: '12px',
                color: colors.textTertiary,
                margin: 0,
                marginTop: spacing[2]
              }}>
                Your main area of research focus
              </p>
            </div>

            {/* Specialties */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                Specialties & Interests
              </label>

              {/* Add New Specialty */}
              <div style={{
                display: 'flex',
                gap: spacing[2],
                marginBottom: spacing[4]
              }}>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                  placeholder="Add a specialty (e.g., Deep Learning, NLP)"
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    fontSize: '14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    fontFamily: 'Inter'
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                <button
                  onClick={handleAddSpecialty}
                  disabled={!newSpecialty.trim()}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: newSpecialty.trim() ? colors.primary : colors.backgroundSecondary,
                    color: newSpecialty.trim() ? 'white' : colors.textTertiary,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newSpecialty.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Specialty List */}
              {specialties.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2]
                }}>
                  {specialties.map((specialty, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        backgroundColor: colors.backgroundSecondary,
                        padding: `${spacing[2]} ${spacing[3]}`,
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: colors.textPrimary,
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>{specialty}</span>
                      <button
                        onClick={() => handleRemoveSpecialty(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: colors.textTertiary,
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = colors.danger}
                        onMouseLeave={(e) => e.target.style.color = colors.textTertiary}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: spacing[6],
                  textAlign: 'center',
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: '8px',
                  border: `1px dashed ${colors.border}`
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: colors.textTertiary,
                    margin: 0
                  }}>
                    No specialties added yet. Add your areas of expertise above.
                  </p>
                </div>
              )}

              <p style={{
                fontSize: '12px',
                color: colors.textTertiary,
                margin: 0,
                marginTop: spacing[2]
              }}>
                Add multiple specialties to help others find you
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: isMobile ? spacing[5] : spacing[6],
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: loading ? colors.backgroundSecondary : colors.primary,
                color: loading ? colors.textTertiary : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResearchInterestsModal;
